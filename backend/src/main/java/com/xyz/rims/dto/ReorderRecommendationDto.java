package com.xyz.rims.dto;

import lombok.*;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReorderRecommendationDto {
    private Long productId;
    private String sku;
    private String productName;
    private String categoryName;
    private Integer currentStock;
    private Integer reorderLevel;
    private Integer recommendedOrderQuantity;
    private BigDecimal estimatedCost;
    private String urgency; // "CRITICAL", "HIGH", "MODERATE", "OPTIMAL", "EXCESS"
    private String reason;
}
