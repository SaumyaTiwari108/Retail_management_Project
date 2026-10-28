package com.xyz.rims;

import com.xyz.rims.dto.StockMovementRequest;
import com.xyz.rims.exception.BadRequestException;
import com.xyz.rims.model.Category;
import com.xyz.rims.model.Product;
import com.xyz.rims.model.StockMovement;
import com.xyz.rims.model.Warehouse;
import com.xyz.rims.repository.CategoryRepository;
import com.xyz.rims.repository.ProductRepository;
import com.xyz.rims.repository.WarehouseRepository;
import com.xyz.rims.service.InventoryService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class InventoryServiceTest {

    @Autowired
    private InventoryService inventoryService;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private WarehouseRepository warehouseRepository;

    private Product product;
    private Warehouse warehouse;

    @BeforeEach
    void setUp() {
        Category cat = categoryRepository.save(Category.builder()
                .name("Inventory Test Category")
                .active(true)
                .build());

        warehouse = warehouseRepository.save(Warehouse.builder()
                .code("WH-TEST-01")
                .name("Test Warehouse")
                .type("WAREHOUSE")
                .active(true)
                .build());

        product = productRepository.save(Product.builder()
                .sku("SKU-INV-TEST")
                .name("Inventory Test Item")
                .category(cat)
                .costPrice(BigDecimal.valueOf(10.00))
                .sellingPrice(BigDecimal.valueOf(25.00))
                .currentStock(20)
                .reorderLevel(5)
                .active(true)
                .build());
    }

    @Test
    void testStockReceivingIncreasesQuantity() {
        StockMovementRequest req = StockMovementRequest.builder()
                .productId(product.getId())
                .warehouseId(warehouse.getId())
                .movementType(StockMovement.MovementType.RECEIVING)
                .quantity(30)
                .referenceNumber("PO-RECEIVE-TEST")
                .remarks("Test shipment arrival")
                .build();

        StockMovement mov = inventoryService.recordMovement(req, "test-user");
        assertEquals(50, mov.getNewStock());
        assertEquals(20, mov.getPreviousStock());

        Product reloaded = productRepository.findById(product.getId()).get();
        assertEquals(50, reloaded.getCurrentStock());
    }

    @Test
    void testSaleDeductsStockCorrectly() {
        StockMovementRequest req = StockMovementRequest.builder()
                .productId(product.getId())
                .warehouseId(warehouse.getId())
                .movementType(StockMovement.MovementType.SALE)
                .quantity(8)
                .referenceNumber("SALE-001")
                .build();

        StockMovement mov = inventoryService.recordMovement(req, "test-user");
        assertEquals(12, mov.getNewStock());

        Product reloaded = productRepository.findById(product.getId()).get();
        assertEquals(12, reloaded.getCurrentStock());
    }

    @Test
    void testInsufficientStockThrowsException() {
        StockMovementRequest req = StockMovementRequest.builder()
                .productId(product.getId())
                .warehouseId(warehouse.getId())
                .movementType(StockMovement.MovementType.SALE)
                .quantity(999) // Way more than available 20
                .build();

        assertThrows(BadRequestException.class, () -> inventoryService.recordMovement(req, "test-user"));
    }
}
