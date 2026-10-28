package com.xyz.rims.service;

import com.xyz.rims.dto.WarehouseDto;
import java.util.List;

public interface WarehouseService {
    List<WarehouseDto> getAllWarehouses();
    WarehouseDto getWarehouseById(Long id);
    WarehouseDto createWarehouse(WarehouseDto dto, String username);
    WarehouseDto updateWarehouse(Long id, WarehouseDto dto, String username);
}
