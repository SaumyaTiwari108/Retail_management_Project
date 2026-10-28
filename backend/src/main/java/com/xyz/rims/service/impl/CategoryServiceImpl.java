package com.xyz.rims.service.impl;

import com.xyz.rims.dto.CategoryDto;
import com.xyz.rims.exception.BadRequestException;
import com.xyz.rims.exception.ResourceNotFoundException;
import com.xyz.rims.model.Category;
import com.xyz.rims.repository.CategoryRepository;
import com.xyz.rims.repository.ProductRepository;
import com.xyz.rims.service.AuditService;
import com.xyz.rims.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final AuditService auditService;

    @Override
    public List<CategoryDto> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public CategoryDto getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + id));
        return mapToDto(category);
    }

    @Override
    @Transactional
    public CategoryDto createCategory(CategoryDto dto, String username) {
        if (categoryRepository.existsByNameIgnoreCase(dto.getName())) {
            throw new BadRequestException("Category with name '" + dto.getName() + "' already exists");
        }

        Category category = Category.builder()
                .name(dto.getName().trim())
                .description(dto.getDescription())
                .active(dto.isActive())
                .build();

        Category saved = categoryRepository.save(category);
        auditService.log("Category", saved.getId(), "CREATE", username, "Created category: " + saved.getName());
        return mapToDto(saved);
    }

    @Override
    @Transactional
    public CategoryDto updateCategory(Long id, CategoryDto dto, String username) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + id));

        categoryRepository.findByNameIgnoreCase(dto.getName())
                .ifPresent(existing -> {
                    if (!existing.getId().equals(id)) {
                        throw new BadRequestException("Another category already exists with name: " + dto.getName());
                    }
                });

        category.setName(dto.getName().trim());
        category.setDescription(dto.getDescription());
        category.setActive(dto.isActive());

        Category updated = categoryRepository.save(category);
        auditService.log("Category", updated.getId(), "UPDATE", username, "Updated category: " + updated.getName());
        return mapToDto(updated);
    }

    @Override
    @Transactional
    public void deleteCategory(Long id, String username) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + id));

        if (!productRepository.findByCategoryId(id).isEmpty()) {
            throw new BadRequestException("Cannot delete category because it has associated products. Reassign or remove products first.");
        }

        categoryRepository.delete(category);
        auditService.log("Category", id, "DELETE", username, "Deleted category: " + category.getName());
    }

    private CategoryDto mapToDto(Category category) {
        return CategoryDto.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .active(category.isActive())
                .createdAt(category.getCreatedAt())
                .updatedAt(category.getUpdatedAt())
                .build();
    }
}
