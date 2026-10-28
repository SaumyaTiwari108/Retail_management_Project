package com.xyz.rims.controller;

import com.xyz.rims.dto.ApiResponse;
import com.xyz.rims.dto.PurchaseOrderDto;
import com.xyz.rims.model.PurchaseOrder;
import com.xyz.rims.service.PurchaseOrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/purchase-orders")
@RequiredArgsConstructor
@Tag(name = "Purchase Orders", description = "Procurement orders and stock receiving")
public class PurchaseOrderController {

    private final PurchaseOrderService poService;

    @GetMapping
    @Operation(summary = "Get all purchase orders")
    public ResponseEntity<ApiResponse<List<PurchaseOrderDto>>> getAllOrders() {
        return ResponseEntity.ok(ApiResponse.ok(poService.getAllOrders()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get purchase order by ID")
    public ResponseEntity<ApiResponse<PurchaseOrderDto>> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(poService.getOrderById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'INVENTORY_MANAGER')")
    @Operation(summary = "Create a purchase order")
    public ResponseEntity<ApiResponse<PurchaseOrderDto>> createOrder(
            @Valid @RequestBody PurchaseOrderDto dto,
            @AuthenticationPrincipal UserDetails userDetails) {
        String username = userDetails != null ? userDetails.getUsername() : "SYSTEM";
        return ResponseEntity.ok(ApiResponse.ok(poService.createOrder(dto, username), "Purchase order created"));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'INVENTORY_MANAGER')")
    @Operation(summary = "Update purchase order status")
    public ResponseEntity<ApiResponse<PurchaseOrderDto>> updateStatus(
            @PathVariable Long id,
            @RequestParam PurchaseOrder.POStatus status,
            @AuthenticationPrincipal UserDetails userDetails) {
        String username = userDetails != null ? userDetails.getUsername() : "SYSTEM";
        return ResponseEntity.ok(ApiResponse.ok(poService.updateStatus(id, status, username), "Status updated"));
    }

    @PostMapping("/{id}/receive")
    @Operation(summary = "Receive shipment against purchase order (updates stock)")
    public ResponseEntity<ApiResponse<PurchaseOrderDto>> receiveOrder(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        String username = userDetails != null ? userDetails.getUsername() : "SYSTEM";
        return ResponseEntity.ok(ApiResponse.ok(poService.receiveOrder(id, username), "Purchase order received and inventory updated"));
    }
}
