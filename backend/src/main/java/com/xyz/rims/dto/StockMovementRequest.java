package com.xyz.rims.dto;

import com.xyz.rims.model.StockMovement;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockMovementRequest {

    @NotNull(message = "Product ID is required")
    private Long productId;

    private Long warehouseId;

    @NotNull(message = "Movement type is required")
    private StockMovement.MovementType movementType; // RECEIVING, SALE, ADJUSTMENT

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    private String referenceNumber;
    private String remarks;
}
