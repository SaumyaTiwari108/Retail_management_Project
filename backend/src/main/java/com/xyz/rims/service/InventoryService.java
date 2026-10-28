package com.xyz.rims.service;

import com.xyz.rims.dto.StockMovementRequest;
import com.xyz.rims.dto.StockTransferRequest;
import com.xyz.rims.model.StockBalance;
import com.xyz.rims.model.StockMovement;

import java.util.List;

public interface InventoryService {
    StockMovement recordMovement(StockMovementRequest request, String username);
    StockMovement transferStock(StockTransferRequest request, String username);
    List<StockBalance> getBalancesByWarehouse(Long warehouseId);
    List<StockBalance> getBalancesByProduct(Long productId);
    List<StockMovement> getMovementsByProduct(Long productId);
    List<StockMovement> getRecentMovements();
    void updateProductStock(Long productId, Long warehouseId, int delta);
}
