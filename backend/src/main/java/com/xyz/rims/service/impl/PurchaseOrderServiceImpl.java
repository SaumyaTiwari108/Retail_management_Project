package com.xyz.rims.service.impl;

import com.xyz.rims.dto.PurchaseOrderDto;
import com.xyz.rims.dto.PurchaseOrderItemDto;
import com.xyz.rims.dto.StockMovementRequest;
import com.xyz.rims.exception.BadRequestException;
import com.xyz.rims.exception.ResourceNotFoundException;
import com.xyz.rims.model.*;
import com.xyz.rims.repository.*;
import com.xyz.rims.service.AuditService;
import com.xyz.rims.service.InventoryService;
import com.xyz.rims.service.PurchaseOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PurchaseOrderServiceImpl implements PurchaseOrderService {

    private final PurchaseOrderRepository poRepository;
    private final SupplierRepository supplierRepository;
    private final WarehouseRepository warehouseRepository;
    private final ProductRepository productRepository;
    private final InventoryService inventoryService;
    private final AuditService auditService;

    @Override
    public List<PurchaseOrderDto> getAllOrders() {
        return poRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public PurchaseOrderDto getOrderById(Long id) {
        PurchaseOrder po = poRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase Order not found with ID: " + id));
        return mapToDto(po);
    }

    @Override
    @Transactional
    public PurchaseOrderDto createOrder(PurchaseOrderDto dto, String username) {
        Supplier supplier = supplierRepository.findById(dto.getSupplierId())
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with ID: " + dto.getSupplierId()));

        Warehouse warehouse = warehouseRepository.findById(dto.getWarehouseId())
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found with ID: " + dto.getWarehouseId()));

        String poNumber = "PO-" + System.currentTimeMillis();

        PurchaseOrder po = PurchaseOrder.builder()
                .poNumber(poNumber)
                .supplier(supplier)
                .warehouse(warehouse)
                .status(PurchaseOrder.POStatus.PLACED)
                .orderDate(dto.getOrderDate() != null ? dto.getOrderDate() : java.time.LocalDate.now())
                .expectedDeliveryDate(dto.getExpectedDeliveryDate())
                .notes(dto.getNotes())
                .createdByUser(username)
                .items(new ArrayList<>())
                .build();

        BigDecimal total = BigDecimal.ZERO;

        for (PurchaseOrderItemDto itemDto : dto.getItems()) {
            Product product = productRepository.findById(itemDto.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + itemDto.getProductId()));

            BigDecimal itemTotal = itemDto.getUnitCost().multiply(BigDecimal.valueOf(itemDto.getQuantityOrdered()));
            total = total.add(itemTotal);

            PurchaseOrderItem item = PurchaseOrderItem.builder()
                    .purchaseOrder(po)
                    .product(product)
                    .quantityOrdered(itemDto.getQuantityOrdered())
                    .quantityReceived(0)
                    .unitCost(itemDto.getUnitCost())
                    .totalCost(itemTotal)
                    .build();

            po.getItems().add(item);
        }

        po.setTotalAmount(total);
        PurchaseOrder saved = poRepository.save(po);

        auditService.log("PurchaseOrder", saved.getId(), "CREATE", username,
                "Created PO " + saved.getPoNumber() + " for supplier " + supplier.getName() + " with total " + total);

        return mapToDto(saved);
    }

    @Override
    @Transactional
    public PurchaseOrderDto updateStatus(Long id, PurchaseOrder.POStatus status, String username) {
        PurchaseOrder po = poRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase Order not found with ID: " + id));

        po.setStatus(status);
        PurchaseOrder updated = poRepository.save(po);
        auditService.log("PurchaseOrder", updated.getId(), "STATUS_CHANGE", username,
                "Changed status of PO " + updated.getPoNumber() + " to " + status);
        return mapToDto(updated);
    }

    @Override
    @Transactional
    public PurchaseOrderDto receiveOrder(Long id, String username) {
        PurchaseOrder po = poRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase Order not found with ID: " + id));

        if (po.getStatus() == PurchaseOrder.POStatus.RECEIVED) {
            throw new BadRequestException("Purchase order " + po.getPoNumber() + " has already been received");
        }
        if (po.getStatus() == PurchaseOrder.POStatus.CANCELLED) {
            throw new BadRequestException("Cannot receive a cancelled purchase order");
        }

        for (PurchaseOrderItem item : po.getItems()) {
            int qtyToReceive = item.getQuantityOrdered() - item.getQuantityReceived();
            if (qtyToReceive > 0) {
                item.setQuantityReceived(item.getQuantityOrdered());

                StockMovementRequest movReq = StockMovementRequest.builder()
                        .productId(item.getProduct().getId())
                        .warehouseId(po.getWarehouse().getId())
                        .movementType(StockMovement.MovementType.RECEIVING)
                        .quantity(qtyToReceive)
                        .referenceNumber(po.getPoNumber())
                        .remarks("Received from supplier " + po.getSupplier().getName() + " via PO " + po.getPoNumber())
                        .build();

                inventoryService.recordMovement(movReq, username);
            }
        }

        po.setStatus(PurchaseOrder.POStatus.RECEIVED);
        po.setReceivedDate(LocalDateTime.now());
        PurchaseOrder saved = poRepository.save(po);

        auditService.log("PurchaseOrder", saved.getId(), "RECEIVE", username,
                "Received stock for PO " + saved.getPoNumber() + " at " + po.getWarehouse().getName());

        return mapToDto(saved);
    }

    private PurchaseOrderDto mapToDto(PurchaseOrder po) {
        List<PurchaseOrderItemDto> itemDtos = po.getItems().stream().map(i ->
                PurchaseOrderItemDto.builder()
                        .id(i.getId())
                        .productId(i.getProduct().getId())
                        .productName(i.getProduct().getName())
                        .productSku(i.getProduct().getSku())
                        .quantityOrdered(i.getQuantityOrdered())
                        .quantityReceived(i.getQuantityReceived())
                        .unitCost(i.getUnitCost())
                        .totalCost(i.getTotalCost())
                        .build()
        ).collect(Collectors.toList());

        return PurchaseOrderDto.builder()
                .id(po.getId())
                .poNumber(po.getPoNumber())
                .supplierId(po.getSupplier().getId())
                .supplierName(po.getSupplier().getName())
                .warehouseId(po.getWarehouse().getId())
                .warehouseName(po.getWarehouse().getName())
                .status(po.getStatus())
                .totalAmount(po.getTotalAmount())
                .orderDate(po.getOrderDate())
                .expectedDeliveryDate(po.getExpectedDeliveryDate())
                .receivedDate(po.getReceivedDate())
                .notes(po.getNotes())
                .createdByUser(po.getCreatedByUser())
                .items(itemDtos)
                .createdAt(po.getCreatedAt())
                .build();
    }
}
