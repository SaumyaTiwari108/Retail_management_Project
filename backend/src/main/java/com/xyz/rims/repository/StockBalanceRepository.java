package com.xyz.rims.repository;

import com.xyz.rims.model.StockBalance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface StockBalanceRepository extends JpaRepository<StockBalance, Long> {
    Optional<StockBalance> findByProductIdAndWarehouseId(Long productId, Long warehouseId);
    List<StockBalance> findByWarehouseId(Long warehouseId);
    List<StockBalance> findByProductId(Long productId);
}
