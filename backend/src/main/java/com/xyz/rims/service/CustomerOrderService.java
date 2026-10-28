package com.xyz.rims.service;

import com.xyz.rims.dto.CustomerOrderDto;
import com.xyz.rims.model.CustomerOrder;
import java.util.List;

public interface CustomerOrderService {
    List<CustomerOrderDto> getAllOrders();
    CustomerOrderDto getOrderById(Long id);
    CustomerOrderDto createOrder(CustomerOrderDto dto, String username);
    CustomerOrderDto updateStatus(Long id, CustomerOrder.OrderStatus status, String username);
    CustomerOrderDto updatePaymentStatus(Long id, CustomerOrder.PaymentStatus status, String username);
}
