package com.xyz.rims.repository;

import com.xyz.rims.model.CustomerOrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CustomerOrderItemRepository extends JpaRepository<CustomerOrderItem, Long> {
    List<CustomerOrderItem> findByCustomerOrderId(Long orderId);

    @Query("SELECT coi.product.id, coi.product.name, SUM(coi.quantity) " +
           "FROM CustomerOrderItem coi WHERE coi.customerOrder.status != com.xyz.rims.model.CustomerOrder.OrderStatus.CANCELLED " +
           "GROUP BY coi.product.id, coi.product.name ORDER BY SUM(coi.quantity) DESC")
    List<Object[]> findTopSellingProducts();
}
