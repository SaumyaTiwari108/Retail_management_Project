package com.xyz.rims.dto;

import com.xyz.rims.model.Product;
import com.xyz.rims.model.StockMovement;
import lombok.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStatsDto {
    private long totalProducts;
    private long totalCategories;
    private BigDecimal totalInventoryValue;
    private long lowStockCount;
    private long outOfStockCount;
    private long pendingOrdersCount;
    private long totalSuppliers;
    private BigDecimal totalRevenue;

    private List<Product> lowStockProducts;
    private List<StockMovement> recentMovements;
    private List<Map<String, Object>> topSellingProducts;
    private Map<String, Long> stockByCategory;
    private Map<String, BigDecimal> monthlySales;
}
