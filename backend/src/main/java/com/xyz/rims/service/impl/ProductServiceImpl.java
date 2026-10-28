package com.xyz.rims.service.impl;

import com.xyz.rims.dto.ProductDto;
import com.xyz.rims.exception.BadRequestException;
import com.xyz.rims.exception.ResourceNotFoundException;
import com.xyz.rims.model.Category;
import com.xyz.rims.model.Product;
import com.xyz.rims.repository.CategoryRepository;
import com.xyz.rims.repository.CustomerOrderItemRepository;
import com.xyz.rims.repository.ProductRepository;
import com.xyz.rims.repository.PurchaseOrderItemRepository;
import com.xyz.rims.service.AuditService;
import com.xyz.rims.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final PurchaseOrderItemRepository poItemRepository;
    private final CustomerOrderItemRepository orderItemRepository;
    private final AuditService auditService;

    @Override
    public List<ProductDto> getAllProducts() {
        return productRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public ProductDto getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + id));
        return mapToDto(product);
    }

    @Override
    public ProductDto getProductBySku(String sku) {
        Product product = productRepository.findBySkuIgnoreCase(sku)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with SKU: " + sku));
        return mapToDto(product);
    }

    @Override
    public ProductDto getProductByBarcode(String barcode) {
        Product product = productRepository.findByBarcode(barcode)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with barcode: " + barcode));
        return mapToDto(product);
    }

    @Override
    public List<ProductDto> searchProducts(String query) {
        if (query == null || query.trim().isEmpty()) {
            return getAllProducts();
        }
        return productRepository.searchProducts(query.trim()).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<ProductDto> getLowStockProducts() {
        return productRepository.findLowStockProducts().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ProductDto createProduct(ProductDto dto, String username) {
        if (productRepository.existsBySkuIgnoreCase(dto.getSku())) {
            throw new BadRequestException("SKU '" + dto.getSku() + "' is already in use");
        }
        if (dto.getBarcode() != null && !dto.getBarcode().trim().isEmpty() && productRepository.existsByBarcode(dto.getBarcode().trim())) {
            throw new BadRequestException("Barcode '" + dto.getBarcode() + "' is already in use");
        }

        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + dto.getCategoryId()));

        Product product = Product.builder()
                .sku(dto.getSku().trim().toUpperCase())
                .name(dto.getName().trim())
                .description(dto.getDescription())
                .category(category)
                .brand(dto.getBrand())
                .barcode(dto.getBarcode() != null ? dto.getBarcode().trim() : null)
                .costPrice(dto.getCostPrice())
                .sellingPrice(dto.getSellingPrice())
                .currentStock(dto.getCurrentStock() != null ? dto.getCurrentStock() : 0)
                .reorderLevel(dto.getReorderLevel() != null ? dto.getReorderLevel() : 10)
                .imageUrl(dto.getImageUrl())
                .active(dto.isActive())
                .build();

        Product saved = productRepository.save(product);
        auditService.log("Product", saved.getId(), "CREATE", username,
                "Created product: " + saved.getName() + " (SKU: " + saved.getSku() + ")");
        return mapToDto(saved);
    }

    @Override
    @Transactional
    public ProductDto updateProduct(Long id, ProductDto dto, String username) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + id));

        productRepository.findBySkuIgnoreCase(dto.getSku())
                .ifPresent(existing -> {
                    if (!existing.getId().equals(id)) {
                        throw new BadRequestException("SKU '" + dto.getSku() + "' is already in use by another product");
                    }
                });

        if (dto.getBarcode() != null && !dto.getBarcode().trim().isEmpty()) {
            productRepository.findByBarcode(dto.getBarcode().trim())
                    .ifPresent(existing -> {
                        if (!existing.getId().equals(id)) {
                            throw new BadRequestException("Barcode '" + dto.getBarcode() + "' is already in use by another product");
                        }
                    });
        }

        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + dto.getCategoryId()));

        product.setSku(dto.getSku().trim().toUpperCase());
        product.setName(dto.getName().trim());
        product.setDescription(dto.getDescription());
        product.setCategory(category);
        product.setBrand(dto.getBrand());
        product.setBarcode(dto.getBarcode() != null ? dto.getBarcode().trim() : null);
        product.setCostPrice(dto.getCostPrice());
        product.setSellingPrice(dto.getSellingPrice());
        product.setCurrentStock(dto.getCurrentStock() != null ? dto.getCurrentStock() : product.getCurrentStock());
        product.setReorderLevel(dto.getReorderLevel() != null ? dto.getReorderLevel() : product.getReorderLevel());
        product.setImageUrl(dto.getImageUrl());
        product.setActive(dto.isActive());

        Product updated = productRepository.save(product);
        auditService.log("Product", updated.getId(), "UPDATE", username,
                "Updated product: " + updated.getName() + " (SKU: " + updated.getSku() + ")");
        return mapToDto(updated);
    }

    @Override
    @Transactional
    public void deleteProduct(Long id, String username) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + id));

        // Soft-delete or safe delete check:
        product.setActive(false);
        productRepository.save(product);
        auditService.log("Product", id, "DEACTIVATE", username, "Deactivated product: " + product.getName());
    }

    private ProductDto mapToDto(Product product) {
        return ProductDto.builder()
                .id(product.getId())
                .sku(product.getSku())
                .name(product.getName())
                .description(product.getDescription())
                .categoryId(product.getCategory().getId())
                .categoryName(product.getCategory().getName())
                .brand(product.getBrand())
                .barcode(product.getBarcode())
                .costPrice(product.getCostPrice())
                .sellingPrice(product.getSellingPrice())
                .currentStock(product.getCurrentStock())
                .reorderLevel(product.getReorderLevel())
                .imageUrl(product.getImageUrl())
                .active(product.isActive())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }
}
