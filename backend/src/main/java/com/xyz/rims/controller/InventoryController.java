package com.xyz.rims.controller;

import com.xyz.rims.dto.ApiResponse;
import com.xyz.rims.dto.StockMovementRequest;
import com.xyz.rims.dto.StockTransferRequest;
import com.xyz.rims.model.StockBalance;
import com.xyz.rims.model.StockMovement;
import com.xyz.rims.service.InventoryService;
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
@RequestMapping("/inventory")
@RequiredArgsConstructor
@Tag(name = "Inventory", description = "Stock balances, transactions, and location transfers")
public class InventoryController {

    private final InventoryService inventoryService;

    @PostMapping("/movement")
    @Operation(summary = "Record stock movement (receiving, sale, or adjustment)")
    public ResponseEntity<ApiResponse<StockMovement>> recordMovement(
            @Valid @RequestBody StockMovementRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        String username = userDetails != null ? userDetails.getUsername() : "SYSTEM";
        return ResponseEntity.ok(ApiResponse.ok(inventoryService.recordMovement(request, username), "Movement recorded"));
    }

    @PostMapping("/transfer")
    @PreAuthorize("hasAnyRole('ADMIN', 'INVENTORY_MANAGER')")
    @Operation(summary = "Transfer stock between warehouses/locations")
    public ResponseEntity<ApiResponse<StockMovement>> transferStock(
            @Valid @RequestBody StockTransferRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        String username = userDetails != null ? userDetails.getUsername() : "SYSTEM";
        return ResponseEntity.ok(ApiResponse.ok(inventoryService.transferStock(request, username), "Stock transfer completed"));
    }

    @GetMapping("/warehouse/{warehouseId}/balances")
    @Operation(summary = "Get stock balances for a warehouse")
    public ResponseEntity<ApiResponse<List<StockBalance>>> getWarehouseBalances(@PathVariable Long warehouseId) {
        return ResponseEntity.ok(ApiResponse.ok(inventoryService.getBalancesByWarehouse(warehouseId)));
    }

    @GetMapping("/product/{productId}/balances")
    @Operation(summary = "Get multi-location balances for a product")
    public ResponseEntity<ApiResponse<List<StockBalance>>> getProductBalances(@PathVariable Long productId) {
        return ResponseEntity.ok(ApiResponse.ok(inventoryService.getBalancesByProduct(productId)));
    }

    @GetMapping("/product/{productId}/movements")
    @Operation(summary = "Get transaction history for a product")
    public ResponseEntity<ApiResponse<List<StockMovement>>> getProductMovements(@PathVariable Long productId) {
        return ResponseEntity.ok(ApiResponse.ok(inventoryService.getMovementsByProduct(productId)));
    }

    @GetMapping("/movements/recent")
    @Operation(summary = "Get recent stock movements")
    public ResponseEntity<ApiResponse<List<StockMovement>>> getRecentMovements() {
        return ResponseEntity.ok(ApiResponse.ok(inventoryService.getRecentMovements()));
    }
}
