package com.xyz.rims.controller;

import com.xyz.rims.dto.ApiResponse;
import com.xyz.rims.dto.CustomerDto;
import com.xyz.rims.service.CustomerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/customers")
@RequiredArgsConstructor
@Tag(name = "Customer Management", description = "Endpoints for managing client profiles and directory")
public class CustomerController {

    private final CustomerService customerService;

    @GetMapping
    @Operation(summary = "Get all customers, optionally filtered by search term")
    public ResponseEntity<ApiResponse<List<CustomerDto>>> getCustomers(@RequestParam(required = false) String search) {
        List<CustomerDto> list = (search != null && !search.isBlank())
                ? customerService.searchCustomers(search)
                : customerService.getAllCustomers();
        return ResponseEntity.ok(ApiResponse.success(list, "Customers retrieved successfully"));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get customer details by ID")
    public ResponseEntity<ApiResponse<CustomerDto>> getCustomerById(@PathVariable Long id) {
        CustomerDto customer = customerService.getCustomerById(id);
        return ResponseEntity.ok(ApiResponse.success(customer, "Customer retrieved successfully"));
    }

    @PostMapping
    @Operation(summary = "Create a new customer profile")
    public ResponseEntity<ApiResponse<CustomerDto>> createCustomer(
            @Valid @RequestBody CustomerDto dto,
            Authentication auth) {
        String currentUsername = auth != null ? auth.getName() : "staff";
        CustomerDto created = customerService.createCustomer(dto, currentUsername);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(created, "Customer created successfully"));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update customer profile")
    public ResponseEntity<ApiResponse<CustomerDto>> updateCustomer(
            @PathVariable Long id,
            @Valid @RequestBody CustomerDto dto,
            Authentication auth) {
        String currentUsername = auth != null ? auth.getName() : "staff";
        CustomerDto updated = customerService.updateCustomer(id, dto, currentUsername);
        return ResponseEntity.ok(ApiResponse.success(updated, "Customer updated successfully"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete customer profile")
    public ResponseEntity<ApiResponse<Void>> deleteCustomer(
            @PathVariable Long id,
            Authentication auth) {
        String currentUsername = auth != null ? auth.getName() : "admin";
        customerService.deleteCustomer(id, currentUsername);
        return ResponseEntity.ok(ApiResponse.success(null, "Customer deleted successfully"));
    }
}
