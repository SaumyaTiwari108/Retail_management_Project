package com.xyz.rims.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseOrderItemDto {
    private Long id;

    @NotNull(message = "Product ID is required")
    private Long productId;
    private String productName;
    private String productSku;

    @NotNull(message = "Quantity ordered is required")
    @Min(value = 1, message = "Quantity ordered must be at least 1")
    private Integer quantityOrdered;

    private Integer quantityReceived;

    @NotNull(message = "Unit cost is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Unit cost must be greater than zero")
    private BigDecimal unitCost;

    private BigDecimal totalCost;
}
