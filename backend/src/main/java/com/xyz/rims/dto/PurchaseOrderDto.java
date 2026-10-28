package com.xyz.rims.dto;

import com.xyz.rims.model.PurchaseOrder;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseOrderDto {
    private Long id;
    private String poNumber;

    @NotNull(message = "Supplier ID is required")
    private Long supplierId;
    private String supplierName;

    @NotNull(message = "Destination warehouse ID is required")
    private Long warehouseId;
    private String warehouseName;

    private PurchaseOrder.POStatus status;
    private BigDecimal totalAmount;
    private LocalDate orderDate;
    private LocalDate expectedDeliveryDate;
    private LocalDateTime receivedDate;
    private String notes;
    private String createdByUser;

    @NotEmpty(message = "Order must contain at least one item")
    private List<PurchaseOrderItemDto> items;

    private LocalDateTime createdAt;
}
