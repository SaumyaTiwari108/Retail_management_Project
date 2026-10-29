package com.xyz.rims.service.impl;

import com.xyz.rims.dto.StockMovementRequest;
import com.xyz.rims.dto.StockTransferRequest;
import com.xyz.rims.exception.BadRequestException;
import com.xyz.rims.exception.ResourceNotFoundException;
import com.xyz.rims.model.Product;
import com.xyz.rims.model.StockBalance;
import com.xyz.rims.model.StockMovement;
import com.xyz.rims.model.Warehouse;
import com.xyz.rims.repository.ProductRepository;
import com.xyz.rims.repository.StockBalanceRepository;
import com.xyz.rims.repository.StockMovementRepository;
import com.xyz.rims.repository.WarehouseRepository;
import com.xyz.rims.service.AuditService;
import com.xyz.rims.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InventoryServiceImpl implements InventoryService {

    private final ProductRepository productRepository;
    private final WarehouseRepository warehouseRepository;
    private final StockBalanceRepository stockBalanceRepository;
    private final StockMovementRepository stockMovementRepository;
    private final AuditService auditService;

    @Override
    @Transactional
    public StockMovement recordMovement(StockMovementRequest request, String username) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + request.getProductId()));

        Warehouse warehouse = null;
        if (request.getWarehouseId() != null) {
            warehouse = warehouseRepository.findById(request.getWarehouseId())
                    .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found with ID: " + request.getWarehouseId()));
        } else {
            // Default to first active warehouse if not specified
            warehouse = warehouseRepository.findByActiveTrue().stream().findFirst()
                    .orElseThrow(() -> new BadRequestException("No active warehouse found in system"));
        }

        if (request.getQuantity() == null || request.getQuantity() == 0) {
            throw new BadRequestException("Quantity must not be zero");
        }

        int previousGlobalStock = product.getCurrentStock();
        int delta = 0;

        if (request.getMovementType() == StockMovement.MovementType.RECEIVING) {
            delta = Math.abs(request.getQuantity());
        } else if (request.getMovementType() == StockMovement.MovementType.SALE) {
            delta = -Math.abs(request.getQuantity());
            if (previousGlobalStock < Math.abs(request.getQuantity())) {
                throw new BadRequestException("Insufficient total stock: requested " + Math.abs(request.getQuantity()) + ", available " + previousGlobalStock);
            }
        } else if (request.getMovementType() == StockMovement.MovementType.ADJUSTMENT) {
            delta = request.getQuantity();
            if (previousGlobalStock + delta < 0) {
                throw new BadRequestException("Adjustment would cause stock to fall below 0");
            }
        }

        int newGlobalStock = previousGlobalStock + delta;
        product.setCurrentStock(newGlobalStock);
        productRepository.save(product);

        // Update warehouse specific stock balance
        updateWarehouseBalance(product, warehouse, delta);

        StockMovement movement = StockMovement.builder()
                .product(product)
                .destinationWarehouse(delta > 0 ? warehouse : null)
                .sourceWarehouse(delta < 0 ? warehouse : null)
                .movementType(request.getMovementType())
                .quantity(Math.abs(delta))
                .previousStock(previousGlobalStock)
                .newStock(newGlobalStock)
                .referenceNumber(request.getReferenceNumber() != null ? request.getReferenceNumber() : "MOV-" + System.currentTimeMillis())
                .userResponsible(username)
                .remarks(request.getRemarks())
                .timestamp(LocalDateTime.now())
                .build();

        StockMovement saved = stockMovementRepository.save(movement);
        auditService.log("StockMovement", saved.getId(), request.getMovementType().name(), username,
                "Stock change for SKU " + product.getSku() + ": " + delta + " (Total: " + newGlobalStock + ")");
        return saved;
    }

    @Override
    @Transactional
    public StockMovement transferStock(StockTransferRequest request, String username) {
        if (request.getSourceWarehouseId().equals(request.getDestinationWarehouseId())) {
            throw new BadRequestException("Source and destination warehouses cannot be the same");
        }

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + request.getProductId()));

        Warehouse source = warehouseRepository.findById(request.getSourceWarehouseId())
                .orElseThrow(() -> new ResourceNotFoundException("Source warehouse not found"));

        Warehouse dest = warehouseRepository.findById(request.getDestinationWarehouseId())
                .orElseThrow(() -> new ResourceNotFoundException("Destination warehouse not found"));

        StockBalance srcBalance = stockBalanceRepository.findByProductIdAndWarehouseId(product.getId(), source.getId())
                .orElseThrow(() -> new BadRequestException("No stock balance found for this product at source warehouse: " + source.getName()));

        if (srcBalance.getQuantity() < request.getQuantity()) {
            throw new BadRequestException("Insufficient stock at " + source.getName() + ": available " + srcBalance.getQuantity() + ", requested " + request.getQuantity());
        }

        // Deduct from source
        srcBalance.setQuantity(srcBalance.getQuantity() - request.getQuantity());
        stockBalanceRepository.save(srcBalance);

        // Add to destination
        updateWarehouseBalance(product, dest, request.getQuantity());

        StockMovement movement = StockMovement.builder()
                .product(product)
                .sourceWarehouse(source)
                .destinationWarehouse(dest)
                .movementType(StockMovement.MovementType.TRANSFER_OUT)
                .quantity(request.getQuantity())
                .previousStock(product.getCurrentStock())
                .newStock(product.getCurrentStock()) // Total overall stock unchanged
                .referenceNumber("TRF-" + System.currentTimeMillis())
                .userResponsible(username)
                .remarks("Transfer from " + source.getCode() + " to " + dest.getCode() + (request.getRemarks() != null ? ": " + request.getRemarks() : ""))
                .timestamp(LocalDateTime.now())
                .build();

        StockMovement saved = stockMovementRepository.save(movement);
        auditService.log("StockTransfer", saved.getId(), "TRANSFER", username,
                "Transferred " + request.getQuantity() + " units of " + product.getSku() + " from " + source.getCode() + " to " + dest.getCode());
        return saved;
    }

    @Override
    public List<StockBalance> getBalancesByWarehouse(Long warehouseId) {
        return stockBalanceRepository.findByWarehouseId(warehouseId);
    }

    @Override
    public List<StockBalance> getBalancesByProduct(Long productId) {
        return stockBalanceRepository.findByProductId(productId);
    }

    @Override
    public List<StockMovement> getMovementsByProduct(Long productId) {
        return stockMovementRepository.findByProductIdOrderByTimestampDesc(productId);
    }

    @Override
    public List<StockMovement> getRecentMovements() {
        return stockMovementRepository.findTop20ByOrderByTimestampDesc();
    }

    @Override
    @Transactional
    public void updateProductStock(Long productId, Long warehouseId, int delta) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + productId));
        Warehouse warehouse = warehouseRepository.findById(warehouseId)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found with ID: " + warehouseId));

        product.setCurrentStock(product.getCurrentStock() + delta);
        productRepository.save(product);
        updateWarehouseBalance(product, warehouse, delta);
    }

    private void updateWarehouseBalance(Product product, Warehouse warehouse, int delta) {
        StockBalance balance = stockBalanceRepository.findByProductIdAndWarehouseId(product.getId(), warehouse.getId())
                .orElseGet(() -> StockBalance.builder()
                        .product(product)
                        .warehouse(warehouse)
                        .quantity(0)
                        .lastUpdated(LocalDateTime.now())
                        .build());

        balance.setQuantity(Math.max(0, balance.getQuantity() + delta));
        stockBalanceRepository.save(balance);
    }
}
