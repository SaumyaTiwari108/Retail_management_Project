package com.xyz.rims.service;

import com.xyz.rims.dto.CategoryDto;
import java.util.List;

public interface CategoryService {
    List<CategoryDto> getAllCategories();
    CategoryDto getCategoryById(Long id);
    CategoryDto createCategory(CategoryDto dto, String username);
    CategoryDto updateCategory(Long id, CategoryDto dto, String username);
    void deleteCategory(Long id, String username);
}
