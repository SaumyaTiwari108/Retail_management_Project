package com.xyz.rims.repository;

import com.xyz.rims.model.Warehouse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface WarehouseRepository extends JpaRepository<Warehouse, Long> {
    Optional<Warehouse> findByCodeIgnoreCase(String code);
    boolean existsByCodeIgnoreCase(String code);
    List<Warehouse> findByActiveTrue();
}
