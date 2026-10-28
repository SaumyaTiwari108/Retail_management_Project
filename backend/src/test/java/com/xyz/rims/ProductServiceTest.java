package com.xyz.rims;

import com.xyz.rims.dto.ProductDto;
import com.xyz.rims.exception.BadRequestException;
import com.xyz.rims.model.Category;
import com.xyz.rims.model.Product;
import com.xyz.rims.repository.CategoryRepository;
import com.xyz.rims.repository.ProductRepository;
import com.xyz.rims.service.ProductService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class ProductServiceTest {

    @Autowired
    private ProductService productService;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ProductRepository productRepository;

    private Category testCategory;

    @BeforeEach
    void setUp() {
        testCategory = categoryRepository.save(Category.builder()
                .name("Test Audio & Video")
                .description("Test category")
                .active(true)
                .build());
    }

    @Test
    void testCreateAndFindProduct() {
        ProductDto dto = ProductDto.builder()
                .sku("TEST-SKU-001")
                .name("Test Bluetooth Speaker")
                .categoryId(testCategory.getId())
                .costPrice(BigDecimal.valueOf(20.00))
                .sellingPrice(BigDecimal.valueOf(45.00))
                .currentStock(50)
                .reorderLevel(10)
                .active(true)
                .build();

        ProductDto created = productService.createProduct(dto, "admin");
        assertNotNull(created.getId());
        assertEquals("TEST-SKU-001", created.getSku());

        ProductDto found = productService.getProductBySku("TEST-SKU-001");
        assertEquals("Test Bluetooth Speaker", found.getName());
    }

    @Test
    void testDuplicateSkuThrowsException() {
        ProductDto dto1 = ProductDto.builder()
                .sku("TEST-DUP-001")
                .name("Item 1")
                .categoryId(testCategory.getId())
                .costPrice(BigDecimal.valueOf(10.00))
                .sellingPrice(BigDecimal.valueOf(20.00))
                .currentStock(10)
                .reorderLevel(5)
                .build();

        productService.createProduct(dto1, "admin");

        ProductDto dto2 = ProductDto.builder()
                .sku("TEST-DUP-001")
                .name("Item 2")
                .categoryId(testCategory.getId())
                .costPrice(BigDecimal.valueOf(15.00))
                .sellingPrice(BigDecimal.valueOf(25.00))
                .currentStock(5)
                .reorderLevel(2)
                .build();

        assertThrows(BadRequestException.class, () -> productService.createProduct(dto2, "admin"));
    }

    @Test
    void testLowStockDetection() {
        ProductDto lowStock = ProductDto.builder()
                .sku("TEST-LOW-001")
                .name("Low Stock Item")
                .categoryId(testCategory.getId())
                .costPrice(BigDecimal.valueOf(5.00))
                .sellingPrice(BigDecimal.valueOf(10.00))
                .currentStock(3)
                .reorderLevel(10)
                .active(true)
                .build();

        productService.createProduct(lowStock, "admin");

        List<ProductDto> lowStockList = productService.getLowStockProducts();
        assertTrue(lowStockList.stream().anyMatch(p -> p.getSku().equals("TEST-LOW-001")));
    }
}
