package com.xyz.rims.service;

import com.xyz.rims.dto.SupplierDto;
import java.util.List;

public interface SupplierService {
    List<SupplierDto> getAllSuppliers();
    SupplierDto getSupplierById(Long id);
    SupplierDto createSupplier(SupplierDto dto, String username);
    SupplierDto updateSupplier(Long id, SupplierDto dto, String username);
}
