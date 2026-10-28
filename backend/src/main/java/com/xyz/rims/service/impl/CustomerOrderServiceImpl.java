package com.xyz.rims.service.impl;

import com.xyz.rims.dto.CustomerOrderDto;
import com.xyz.rims.dto.CustomerOrderItemDto;
import com.xyz.rims.dto.StockMovementRequest;
import com.xyz.rims.exception.BadRequestException;
import com.xyz.rims.exception.ResourceNotFoundException;
import com.xyz.rims.model.*;
import com.xyz.rims.repository.*;
import com.xyz.rims.service.AuditService;
import com.xyz.rims.service.CustomerOrderService;
import com.xyz.rims.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerOrderServiceImpl implements CustomerOrderService {

    private final CustomerOrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final WarehouseRepository warehouseRepository;
    private final ProductRepository productRepository;
    private final InventoryService inventoryService;
    private final AuditService auditService;

    @Override
    public List<CustomerOrderDto> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public CustomerOrderDto getOrderById(Long id) {
        CustomerOrder order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer order not found with ID: " + id));
        return mapToDto(order);
    }

    @Override
    @Transactional
    public CustomerOrderDto createOrder(CustomerOrderDto dto, String username) {
        Customer customer;
        if (dto.getCustomerId() != null) {
            customer = customerRepository.findById(dto.getCustomerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + dto.getCustomerId()));
        } else {
            customer = Customer.builder()
                    .name(dto.getCustomerName() != null ? dto.getCustomerName() : "Walk-in Customer")
                    .email(dto.getCustomerEmail())
                    .phone(dto.getCustomerPhone())
                    .build();
            customer = customerRepository.save(customer);
        }

        Warehouse warehouse = warehouseRepository.findById(dto.getWarehouseId())
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found with ID: " + dto.getWarehouseId()));

        // Pre-validate stock availability for all items before making any modifications
        for (CustomerOrderItemDto itemDto : dto.getItems()) {
            Product p = productRepository.findById(itemDto.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + itemDto.getProductId()));

            if (p.getCurrentStock() < itemDto.getQuantity()) {
                throw new BadRequestException("Insufficient stock for product '" + p.getName() + "'. Available: " + p.getCurrentStock() + ", Requested: " + itemDto.getQuantity());
            }
        }

        String orderNumber = "ORD-" + System.currentTimeMillis();

        CustomerOrder order = CustomerOrder.builder()
                .orderNumber(orderNumber)
                .customer(customer)
                .warehouse(warehouse)
                .status(CustomerOrder.OrderStatus.CONFIRMED)
                .paymentStatus(dto.getPaymentStatus() != null ? dto.getPaymentStatus() : CustomerOrder.PaymentStatus.PAID)
                .paymentMethod(dto.getPaymentMethod() != null ? dto.getPaymentMethod() : "CASH")
                .orderDate(LocalDateTime.now())
                .notes(dto.getNotes())
                .createdByUser(username)
                .items(new ArrayList<>())
                .build();

        BigDecimal subtotal = BigDecimal.ZERO;

        for (CustomerOrderItemDto itemDto : dto.getItems()) {
            Product product = productRepository.findById(itemDto.getProductId()).get();
            BigDecimal lineTotal = itemDto.getUnitPrice().multiply(BigDecimal.valueOf(itemDto.getQuantity()));
            subtotal = subtotal.add(lineTotal);

            CustomerOrderItem item = CustomerOrderItem.builder()
                    .customerOrder(order)
                    .product(product)
                    .quantity(itemDto.getQuantity())
                    .unitPrice(itemDto.getUnitPrice())
                    .totalPrice(lineTotal)
                    .build();

            order.getItems().add(item);

            // Deduct stock immediately & log movement
            StockMovementRequest movReq = StockMovementRequest.builder()
                    .productId(product.getId())
                    .warehouseId(warehouse.getId())
                    .movementType(StockMovement.MovementType.SALE)
                    .quantity(itemDto.getQuantity())
                    .referenceNumber(orderNumber)
                    .remarks("Sale fulfill order " + orderNumber + " for " + customer.getName())
                    .build();

            inventoryService.recordMovement(movReq, username);
        }

        BigDecimal tax = subtotal.multiply(BigDecimal.valueOf(0.05)); // 5% standard retail tax
        BigDecimal discount = dto.getDiscount() != null ? dto.getDiscount() : BigDecimal.ZERO;
        BigDecimal total = subtotal.add(tax).subtract(discount);

        order.setSubtotal(subtotal);
        order.setTax(tax);
        order.setDiscount(discount);
        order.setTotalAmount(total);

        CustomerOrder saved = orderRepository.save(order);
        auditService.log("CustomerOrder", saved.getId(), "CREATE", username,
                "Created order " + saved.getOrderNumber() + " with total amount " + total);

        return mapToDto(saved);
    }

    @Override
    @Transactional
    public CustomerOrderDto updateStatus(Long id, CustomerOrder.OrderStatus newStatus, String username) {
        CustomerOrder order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer order not found with ID: " + id));

        CustomerOrder.OrderStatus oldStatus = order.getStatus();

        if (oldStatus == newStatus) {
            return mapToDto(order);
        }

        // Handle cancellation: restore stock safely
        if (newStatus == CustomerOrder.OrderStatus.CANCELLED && oldStatus != CustomerOrder.OrderStatus.CANCELLED) {
            for (CustomerOrderItem item : order.getItems()) {
                StockMovementRequest movReq = StockMovementRequest.builder()
                        .productId(item.getProduct().getId())
                        .warehouseId(order.getWarehouse().getId())
                        .movementType(StockMovement.MovementType.RECEIVING)
                        .quantity(item.getQuantity())
                        .referenceNumber("RESTORE-" + order.getOrderNumber())
                        .remarks("Stock restored due to cancellation of order " + order.getOrderNumber())
                        .build();

                inventoryService.recordMovement(movReq, username);
            }
            order.setPaymentStatus(CustomerOrder.PaymentStatus.REFUNDED);
        }

        order.setStatus(newStatus);
        CustomerOrder saved = orderRepository.save(order);

        auditService.log("CustomerOrder", saved.getId(), "STATUS_CHANGE", username,
                "Changed status of order " + saved.getOrderNumber() + " from " + oldStatus + " to " + newStatus);

        return mapToDto(saved);
    }

    @Override
    @Transactional
    public CustomerOrderDto updatePaymentStatus(Long id, CustomerOrder.PaymentStatus status, String username) {
        CustomerOrder order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer order not found with ID: " + id));

        order.setPaymentStatus(status);
        CustomerOrder saved = orderRepository.save(order);
        auditService.log("CustomerOrder", saved.getId(), "PAYMENT_STATUS", username,
                "Updated payment status of order " + saved.getOrderNumber() + " to " + status);
        return mapToDto(saved);
    }

    private CustomerOrderDto mapToDto(CustomerOrder order) {
        List<CustomerOrderItemDto> itemDtos = order.getItems().stream().map(i ->
                CustomerOrderItemDto.builder()
                        .id(i.getId())
                        .productId(i.getProduct().getId())
                        .productName(i.getProduct().getName())
                        .productSku(i.getProduct().getSku())
                        .quantity(i.getQuantity())
                        .unitPrice(i.getUnitPrice())
                        .totalPrice(i.getTotalPrice())
                        .build()
        ).collect(Collectors.toList());

        return CustomerOrderDto.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .customerId(order.getCustomer().getId())
                .customerName(order.getCustomer().getName())
                .customerEmail(order.getCustomer().getEmail())
                .customerPhone(order.getCustomer().getPhone())
                .warehouseId(order.getWarehouse().getId())
                .warehouseName(order.getWarehouse().getName())
                .status(order.getStatus())
                .paymentStatus(order.getPaymentStatus())
                .paymentMethod(order.getPaymentMethod())
                .subtotal(order.getSubtotal())
                .tax(order.getTax())
                .discount(order.getDiscount())
                .totalAmount(order.getTotalAmount())
                .orderDate(order.getOrderDate())
                .notes(order.getNotes())
                .createdByUser(order.getCreatedByUser())
                .items(itemDtos)
                .createdAt(order.getCreatedAt())
                .build();
    }
}
