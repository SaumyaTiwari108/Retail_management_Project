package com.xyz.rims.service.impl;

import com.xyz.rims.dto.DashboardStatsDto;
import com.xyz.rims.dto.ReorderRecommendationDto;
import com.xyz.rims.model.Product;
import com.xyz.rims.model.PurchaseOrder;
import com.xyz.rims.repository.*;
import com.xyz.rims.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsServiceImpl implements AnalyticsService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final SupplierRepository supplierRepository;
    private final PurchaseOrderRepository poRepository;
    private final CustomerOrderRepository orderRepository;
    private final CustomerOrderItemRepository orderItemRepository;
    private final StockMovementRepository movementRepository;

    @Override
    public DashboardStatsDto getDashboardStats() {
        long totalProducts = productRepository.count();
        long totalCategories = categoryRepository.count();
        BigDecimal totalInventoryValue = productRepository.calculateTotalInventoryCost();
        List<Product> lowStock = productRepository.findLowStockProducts();
        List<Product> outOfStock = productRepository.findOutOfStockProducts();
        long pendingOrders = poRepository.countByStatus(PurchaseOrder.POStatus.PLACED);
        long totalSuppliers = supplierRepository.count();
        BigDecimal totalRevenue = orderRepository.calculateTotalRevenue();

        // Stock by category distribution
        Map<String, Long> stockByCategory = new HashMap<>();
        List<Product> allProducts = productRepository.findAll();
        for (Product p : allProducts) {
            String catName = p.getCategory().getName();
            stockByCategory.put(catName, stockByCategory.getOrDefault(catName, 0L) + p.getCurrentStock());
        }

        // Top selling products
        List<Map<String, Object>> topSelling = new ArrayList<>();
        List<Object[]> topData = orderItemRepository.findTopSellingProducts();
        for (int i = 0; i < Math.min(topData.size(), 5); i++) {
            Object[] row = topData.get(i);
            Map<String, Object> map = new HashMap<>();
            map.put("productId", row[0]);
            map.put("name", row[1]);
            map.put("totalSold", row[2]);
            topSelling.add(map);
        }

        // Monthly mock trend distribution for analytics chart
        Map<String, BigDecimal> monthlySales = new LinkedHashMap<>();
        monthlySales.put("May", BigDecimal.valueOf(14200));
        monthlySales.put("Jun", BigDecimal.valueOf(18500));
        monthlySales.put("Jul", BigDecimal.valueOf(16300));
        monthlySales.put("Aug", BigDecimal.valueOf(22400));
        monthlySales.put("Sep", BigDecimal.valueOf(28900));
        monthlySales.put("Oct", totalRevenue.max(BigDecimal.valueOf(31200)));

        return DashboardStatsDto.builder()
                .totalProducts(totalProducts)
                .totalCategories(totalCategories)
                .totalInventoryValue(totalInventoryValue)
                .lowStockCount(lowStock.size())
                .outOfStockCount(outOfStock.size())
                .pendingOrdersCount(pendingOrders)
                .totalSuppliers(totalSuppliers)
                .totalRevenue(totalRevenue)
                .lowStockProducts(lowStock.stream().limit(6).collect(Collectors.toList()))
                .recentMovements(movementRepository.findTop20ByOrderByTimestampDesc().stream().limit(6).collect(Collectors.toList()))
                .topSellingProducts(topSelling)
                .stockByCategory(stockByCategory)
                .monthlySales(monthlySales)
                .build();
    }

    @Override
    public List<ReorderRecommendationDto> getReorderRecommendations() {
        List<Product> products = productRepository.findAll();
        List<ReorderRecommendationDto> recommendations = new ArrayList<>();

        for (Product p : products) {
            int current = p.getCurrentStock();
            int reorder = p.getReorderLevel();

            String urgency = null;
            String reason = null;
            int recommendedQty = 0;

            if (current == 0) {
                urgency = "CRITICAL";
                reason = "Out of stock! Immediate replenishment required to avoid lost revenue.";
                recommendedQty = reorder * 2;
            } else if (current <= reorder / 2) {
                urgency = "HIGH";
                reason = "Stock is below 50% of reorder threshold. Stockout imminent.";
                recommendedQty = (reorder * 2) - current;
            } else if (current <= reorder) {
                urgency = "MODERATE";
                reason = "Stock has dropped to or below safe buffer level.";
                recommendedQty = (reorder * 2) - current;
            } else if (current > reorder * 4 && reorder > 0) {
                urgency = "EXCESS";
                reason = "High inventory levels detected exceeding 4x reorder buffer. Consider slowing purchasing.";
                recommendedQty = 0;
            }

            if (urgency != null) {
                BigDecimal estimatedCost = p.getCostPrice().multiply(BigDecimal.valueOf(recommendedQty));
                recommendations.add(ReorderRecommendationDto.builder()
                        .productId(p.getId())
                        .sku(p.getSku())
                        .productName(p.getName())
                        .categoryName(p.getCategory().getName())
                        .currentStock(current)
                        .reorderLevel(reorder)
                        .recommendedOrderQuantity(recommendedQty)
                        .estimatedCost(estimatedCost)
                        .urgency(urgency)
                        .reason(reason)
                        .build());
            }
        }

        // Sort by urgency priority (CRITICAL -> HIGH -> MODERATE -> EXCESS)
        Map<String, Integer> priority = Map.of("CRITICAL", 1, "HIGH", 2, "MODERATE", 3, "EXCESS", 4);
        recommendations.sort(Comparator.comparingInt(r -> priority.getOrDefault(r.getUrgency(), 5)));

        return recommendations;
    }

    @Override
    public byte[] exportInventoryCsv() {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (PrintWriter writer = new PrintWriter(out, true, StandardCharsets.UTF_8)) {
            writer.println("SKU,Product Name,Category,Brand,Barcode,Cost Price,Selling Price,Current Stock,Reorder Level,Total Valuation,Status");
            List<Product> products = productRepository.findAll();
            for (Product p : products) {
                BigDecimal totalVal = p.getCostPrice().multiply(BigDecimal.valueOf(p.getCurrentStock()));
                writer.printf("\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",%.2f,%.2f,%d,%d,%.2f,\"%s\"%n",
                        p.getSku(),
                        p.getName().replace("\"", "\"\""),
                        p.getCategory().getName().replace("\"", "\"\""),
                        p.getBrand() != null ? p.getBrand().replace("\"", "\"\"") : "",
                        p.getBarcode() != null ? p.getBarcode() : "",
                        p.getCostPrice(),
                        p.getSellingPrice(),
                        p.getCurrentStock(),
                        p.getReorderLevel(),
                        totalVal,
                        p.isActive() ? "Active" : "Inactive"
                );
            }
        }
        return out.toByteArray();
    }
}
