package com.xyz.rims.service.impl;

import com.xyz.rims.dto.CustomerDto;
import com.xyz.rims.exception.BadRequestException;
import com.xyz.rims.exception.ResourceNotFoundException;
import com.xyz.rims.model.Customer;
import com.xyz.rims.repository.CustomerOrderRepository;
import com.xyz.rims.repository.CustomerRepository;
import com.xyz.rims.service.AuditService;
import com.xyz.rims.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;
    private final CustomerOrderRepository customerOrderRepository;
    private final AuditService auditService;

    @Override
    public List<CustomerDto> getAllCustomers() {
        return customerRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public CustomerDto getCustomerById(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + id));
        return mapToDto(customer);
    }

    @Override
    public List<CustomerDto> searchCustomers(String query) {
        if (query == null || query.isBlank()) {
            return getAllCustomers();
        }
        return customerRepository.findByNameContainingIgnoreCase(query.trim()).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CustomerDto createCustomer(CustomerDto dto, String currentUsername) {
        Customer customer = Customer.builder()
                .name(dto.getName().trim())
                .email(dto.getEmail() != null ? dto.getEmail().trim() : null)
                .phone(dto.getPhone() != null ? dto.getPhone().trim() : null)
                .address(dto.getAddress() != null ? dto.getAddress().trim() : null)
                .build();

        Customer saved = customerRepository.save(customer);
        auditService.log("Customer", saved.getId(), "CREATE", currentUsername,
                "Registered customer profile: " + saved.getName());
        return mapToDto(saved);
    }

    @Override
    @Transactional
    public CustomerDto updateCustomer(Long id, CustomerDto dto, String currentUsername) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + id));

        customer.setName(dto.getName().trim());
        customer.setEmail(dto.getEmail() != null ? dto.getEmail().trim() : null);
        customer.setPhone(dto.getPhone() != null ? dto.getPhone().trim() : null);
        customer.setAddress(dto.getAddress() != null ? dto.getAddress().trim() : null);

        Customer updated = customerRepository.save(customer);
        auditService.log("Customer", updated.getId(), "UPDATE", currentUsername,
                "Updated customer profile: " + updated.getName());
        return mapToDto(updated);
    }

    @Override
    @Transactional
    public void deleteCustomer(Long id, String currentUsername) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + id));

        if (customerOrderRepository.existsByCustomerId(id)) {
            throw new BadRequestException("Cannot delete customer '" + customer.getName() + "' because historical sales orders exist. Preserve records for accounting compliance.");
        }

        customerRepository.delete(customer);
        auditService.log("Customer", id, "DELETE", currentUsername,
                "Deleted customer profile: " + customer.getName());
    }

    private CustomerDto mapToDto(Customer c) {
        return CustomerDto.builder()
                .id(c.getId())
                .name(c.getName())
                .email(c.getEmail())
                .phone(c.getPhone())
                .address(c.getAddress())
                .createdAt(c.getCreatedAt())
                .build();
    }
}
