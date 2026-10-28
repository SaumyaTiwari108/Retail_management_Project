package com.xyz.rims.repository;

import com.xyz.rims.model.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Long> {
    Optional<Supplier> findByNameIgnoreCase(String name);
    boolean existsByNameIgnoreCase(String name);
    List<Supplier> findByStatus(String status);
}
