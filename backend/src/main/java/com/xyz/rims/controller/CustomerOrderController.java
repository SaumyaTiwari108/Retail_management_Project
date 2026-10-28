package com.xyz.rims.controller;

import com.xyz.rims.dto.ApiResponse;
import com.xyz.rims.dto.CustomerOrderDto;
import com.xyz.rims.model.CustomerOrder;
import com.xyz.rims.service.CustomerOrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
@Tag(name = "Customer Orders", description = "POS sales, order fulfillment, and invoices")
public class CustomerOrderController {

    private final CustomerOrderService orderService;

    @GetMapping
    @Operation(summary = "Get all customer sales orders")
    public ResponseEntity<ApiResponse<List<CustomerOrderDto>>> getAllOrders() {
        return ResponseEntity.ok(ApiResponse.ok(orderService.getAllOrders()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get order by ID (with line items and customer details)")
    public ResponseEntity<ApiResponse<CustomerOrderDto>> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(orderService.getOrderById(id)));
    }

    @PostMapping
    @Operation(summary = "Create customer sales order (validates stock and deducts inventory)")
    public ResponseEntity<ApiResponse<CustomerOrderDto>> createOrder(
            @Valid @RequestBody CustomerOrderDto dto,
            @AuthenticationPrincipal UserDetails userDetails) {
        String username = userDetails != null ? userDetails.getUsername() : "SYSTEM";
        return ResponseEntity.ok(ApiResponse.ok(orderService.createOrder(dto, username), "Sales order created successfully"));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update order status (cancelling order automatically restores inventory)")
    public ResponseEntity<ApiResponse<CustomerOrderDto>> updateStatus(
            @PathVariable Long id,
            @RequestParam CustomerOrder.OrderStatus status,
            @AuthenticationPrincipal UserDetails userDetails) {
        String username = userDetails != null ? userDetails.getUsername() : "SYSTEM";
        return ResponseEntity.ok(ApiResponse.ok(orderService.updateStatus(id, status, username), "Order status updated"));
    }

    @PatchMapping("/{id}/payment-status")
    @Operation(summary = "Update order payment status")
    public ResponseEntity<ApiResponse<CustomerOrderDto>> updatePaymentStatus(
            @PathVariable Long id,
            @RequestParam CustomerOrder.PaymentStatus status,
            @AuthenticationPrincipal UserDetails userDetails) {
        String username = userDetails != null ? userDetails.getUsername() : "SYSTEM";
        return ResponseEntity.ok(ApiResponse.ok(orderService.updatePaymentStatus(id, status, username), "Payment status updated"));
    }
}
