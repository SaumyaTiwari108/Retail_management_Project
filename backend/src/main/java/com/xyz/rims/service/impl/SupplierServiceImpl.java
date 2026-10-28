package com.xyz.rims.service.impl;

import com.xyz.rims.dto.SupplierDto;
import com.xyz.rims.exception.BadRequestException;
import com.xyz.rims.exception.ResourceNotFoundException;
import com.xyz.rims.model.Supplier;
import com.xyz.rims.repository.SupplierRepository;
import com.xyz.rims.service.AuditService;
import com.xyz.rims.service.SupplierService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SupplierServiceImpl implements SupplierService {

    private final SupplierRepository supplierRepository;
    private final AuditService auditService;

    @Override
    public List<SupplierDto> getAllSuppliers() {
        return supplierRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public SupplierDto getSupplierById(Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with ID: " + id));
        return mapToDto(supplier);
    }

    @Override
    @Transactional
    public SupplierDto createSupplier(SupplierDto dto, String username) {
        if (supplierRepository.existsByNameIgnoreCase(dto.getName())) {
            throw new BadRequestException("Supplier with name '" + dto.getName() + "' already exists");
        }

        Supplier supplier = Supplier.builder()
                .name(dto.getName().trim())
                .contactPerson(dto.getContactPerson())
                .email(dto.getEmail())
                .phone(dto.getPhone())
                .address(dto.getAddress())
                .status(dto.getStatus() != null ? dto.getStatus() : "ACTIVE")
                .build();

        Supplier saved = supplierRepository.save(supplier);
        auditService.log("Supplier", saved.getId(), "CREATE", username, "Registered supplier: " + saved.getName());
        return mapToDto(saved);
    }

    @Override
    @Transactional
    public SupplierDto updateSupplier(Long id, SupplierDto dto, String username) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with ID: " + id));

        supplier.setName(dto.getName().trim());
        supplier.setContactPerson(dto.getContactPerson());
        supplier.setEmail(dto.getEmail());
        supplier.setPhone(dto.getPhone());
        supplier.setAddress(dto.getAddress());
        supplier.setStatus(dto.getStatus());

        Supplier updated = supplierRepository.save(supplier);
        auditService.log("Supplier", updated.getId(), "UPDATE", username, "Updated supplier: " + updated.getName());
        return mapToDto(updated);
    }

    private SupplierDto mapToDto(Supplier s) {
        return SupplierDto.builder()
                .id(s.getId())
                .name(s.getName())
                .contactPerson(s.getContactPerson())
                .email(s.getEmail())
                .phone(s.getPhone())
                .address(s.getAddress())
                .status(s.getStatus())
                .createdAt(s.getCreatedAt())
                .build();
    }
}
