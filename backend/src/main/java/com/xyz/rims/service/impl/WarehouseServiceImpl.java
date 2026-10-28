package com.xyz.rims.service.impl;

import com.xyz.rims.dto.WarehouseDto;
import com.xyz.rims.exception.BadRequestException;
import com.xyz.rims.exception.ResourceNotFoundException;
import com.xyz.rims.model.Warehouse;
import com.xyz.rims.repository.WarehouseRepository;
import com.xyz.rims.service.AuditService;
import com.xyz.rims.service.WarehouseService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WarehouseServiceImpl implements WarehouseService {

    private final WarehouseRepository warehouseRepository;
    private final AuditService auditService;

    @Override
    public List<WarehouseDto> getAllWarehouses() {
        return warehouseRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public WarehouseDto getWarehouseById(Long id) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found with ID: " + id));
        return mapToDto(warehouse);
    }

    @Override
    @Transactional
    public WarehouseDto createWarehouse(WarehouseDto dto, String username) {
        if (warehouseRepository.existsByCodeIgnoreCase(dto.getCode())) {
            throw new BadRequestException("Warehouse code '" + dto.getCode() + "' already exists");
        }

        Warehouse warehouse = Warehouse.builder()
                .code(dto.getCode().trim().toUpperCase())
                .name(dto.getName().trim())
                .type(dto.getType())
                .address(dto.getAddress())
                .city(dto.getCity())
                .phone(dto.getPhone())
                .active(dto.isActive())
                .build();

        Warehouse saved = warehouseRepository.save(warehouse);
        auditService.log("Warehouse", saved.getId(), "CREATE", username, "Created location: " + saved.getName());
        return mapToDto(saved);
    }

    @Override
    @Transactional
    public WarehouseDto updateWarehouse(Long id, WarehouseDto dto, String username) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse not found with ID: " + id));

        warehouse.setName(dto.getName().trim());
        warehouse.setType(dto.getType());
        warehouse.setAddress(dto.getAddress());
        warehouse.setCity(dto.getCity());
        warehouse.setPhone(dto.getPhone());
        warehouse.setActive(dto.isActive());

        Warehouse updated = warehouseRepository.save(warehouse);
        auditService.log("Warehouse", updated.getId(), "UPDATE", username, "Updated location: " + updated.getName());
        return mapToDto(updated);
    }

    private WarehouseDto mapToDto(Warehouse w) {
        return WarehouseDto.builder()
                .id(w.getId())
                .code(w.getCode())
                .name(w.getName())
                .type(w.getType())
                .address(w.getAddress())
                .city(w.getCity())
                .phone(w.getPhone())
                .active(w.isActive())
                .createdAt(w.getCreatedAt())
                .build();
    }
}
