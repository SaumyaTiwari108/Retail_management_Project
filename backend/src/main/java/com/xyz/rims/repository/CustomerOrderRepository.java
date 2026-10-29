package com.xyz.rims.repository;

import com.xyz.rims.model.CustomerOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerOrderRepository extends JpaRepository<CustomerOrder, Long> {
    Optional<CustomerOrder> findByOrderNumber(String orderNumber);
    boolean existsByOrderNumber(String orderNumber);
    boolean existsByCustomerId(Long customerId);
    List<CustomerOrder> findByStatus(CustomerOrder.OrderStatus status);
    List<CustomerOrder> findTop10ByOrderByOrderDateDesc();
    long countByStatus(CustomerOrder.OrderStatus status);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM CustomerOrder o WHERE o.status != com.xyz.rims.model.CustomerOrder.OrderStatus.CANCELLED")
    BigDecimal calculateTotalRevenue();
}
