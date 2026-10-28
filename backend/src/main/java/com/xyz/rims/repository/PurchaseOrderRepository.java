package com.xyz.rims.repository;

import com.xyz.rims.model.PurchaseOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {
    Optional<PurchaseOrder> findByPoNumber(String poNumber);
    boolean existsByPoNumber(String poNumber);
    List<PurchaseOrder> findByStatus(PurchaseOrder.POStatus status);
    List<PurchaseOrder> findTop10ByOrderByCreatedAtDesc();
    long countByStatus(PurchaseOrder.POStatus status);
}
