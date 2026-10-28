package com.xyz.rims.service;

import com.xyz.rims.dto.ProductDto;
import java.util.List;

public interface ProductService {
    List<ProductDto> getAllProducts();
    ProductDto getProductById(Long id);
    ProductDto getProductBySku(String sku);
    ProductDto getProductByBarcode(String barcode);
    List<ProductDto> searchProducts(String query);
    List<ProductDto> getLowStockProducts();
    ProductDto createProduct(ProductDto dto, String username);
    ProductDto updateProduct(Long id, ProductDto dto, String username);
    void deleteProduct(Long id, String username);
}
