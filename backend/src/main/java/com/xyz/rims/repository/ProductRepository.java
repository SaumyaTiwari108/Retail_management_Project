package com.xyz.rims.repository;

import com.xyz.rims.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    Optional<Product> findBySkuIgnoreCase(String sku);
    Optional<Product> findByBarcode(String barcode);
    boolean existsBySkuIgnoreCase(String sku);
    boolean existsByBarcode(String barcode);
    List<Product> findByCategoryId(Long categoryId);
    List<Product> findByActiveTrue();

    @Query("SELECT p FROM Product p WHERE p.currentStock <= p.reorderLevel AND p.active = true")
    List<Product> findLowStockProducts();

    @Query("SELECT p FROM Product p WHERE p.currentStock = 0 AND p.active = true")
    List<Product> findOutOfStockProducts();

    @Query("SELECT COALESCE(SUM(p.currentStock * p.costPrice), 0) FROM Product p WHERE p.active = true")
    BigDecimal calculateTotalInventoryCost();

    @Query("SELECT p FROM Product p WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(p.sku) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(p.barcode) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Product> searchProducts(@Param("query") String query);
}
