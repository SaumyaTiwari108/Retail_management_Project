package com.xyz.rims.dto;

import com.xyz.rims.model.CustomerOrder;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerOrderDto {
    private Long id;
    private String orderNumber;

    private Long customerId;
    private String customerName;
    private String customerEmail;
    private String customerPhone;

    @NotNull(message = "Fulfillment warehouse ID is required")
    private Long warehouseId;
    private String warehouseName;

    private CustomerOrder.OrderStatus status;
    private CustomerOrder.PaymentStatus paymentStatus;
    private String paymentMethod;
    private BigDecimal subtotal;
    private BigDecimal tax;
    private BigDecimal discount;
    private BigDecimal totalAmount;
    private LocalDateTime orderDate;
    private String notes;
    private String createdByUser;

    @NotEmpty(message = "Order must have at least one line item")
    private List<CustomerOrderItemDto> items;

    private LocalDateTime createdAt;
}
