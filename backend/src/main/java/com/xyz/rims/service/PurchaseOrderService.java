package com.xyz.rims.service;

import com.xyz.rims.dto.PurchaseOrderDto;
import com.xyz.rims.model.PurchaseOrder;
import java.util.List;

public interface PurchaseOrderService {
    List<PurchaseOrderDto> getAllOrders();
    PurchaseOrderDto getOrderById(Long id);
    PurchaseOrderDto createOrder(PurchaseOrderDto dto, String username);
    PurchaseOrderDto updateStatus(Long id, PurchaseOrder.POStatus status, String username);
    PurchaseOrderDto receiveOrder(Long id, String username);
}
