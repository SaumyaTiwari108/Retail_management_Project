package com.xyz.rims.service;

import com.xyz.rims.dto.CustomerDto;

import java.util.List;

public interface CustomerService {
    List<CustomerDto> getAllCustomers();
    CustomerDto getCustomerById(Long id);
    List<CustomerDto> searchCustomers(String query);
    CustomerDto createCustomer(CustomerDto dto, String currentUsername);
    CustomerDto updateCustomer(Long id, CustomerDto dto, String currentUsername);
    void deleteCustomer(Long id, String currentUsername);
}
