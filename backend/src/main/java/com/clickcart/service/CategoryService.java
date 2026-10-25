package com.clickcart.service;

import com.clickcart.dto.CategoryRequest;
import com.clickcart.dto.CategoryResponse;
import com.clickcart.exception.ResourceNotFoundException;
import com.clickcart.model.Category;
import com.clickcart.repository.CategoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public CategoryResponse createCategory(CategoryRequest request) {
        Category category = new Category();
        category.setName(request.getName());
        category.setIcon(request.getIcon());
        
        if (request.getSubcategories() != null) {
            category.setSubcategories(request.getSubcategories());
        }
        
        if (request.getActive() != null) {
            category.setActive(request.getActive());
        }

        Category savedCategory = categoryRepository.save(category);
        return mapToResponse(savedCategory);
    }

    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public CategoryResponse getCategoryById(String id) {
        Category category = getCategoryEntityById(id);
        return mapToResponse(category);
    }

    public CategoryResponse updateCategory(String id, CategoryRequest request) {
        Category category = getCategoryEntityById(id);
        
        category.setName(request.getName());
        category.setIcon(request.getIcon());
        
        if (request.getSubcategories() != null) {
            category.setSubcategories(request.getSubcategories());
        }
        
        if (request.getActive() != null) {
            category.setActive(request.getActive());
        }

        Category updatedCategory = categoryRepository.save(category);
        return mapToResponse(updatedCategory);
    }

    public CategoryResponse toggleStatus(String id) {
        Category category = getCategoryEntityById(id);
        category.setActive(!category.isActive());
        Category updatedCategory = categoryRepository.save(category);
        return mapToResponse(updatedCategory);
    }

    public void deleteCategory(String id) {
        Category category = getCategoryEntityById(id);
        categoryRepository.delete(category);
    }

    private Category getCategoryEntityById(String id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
    }

    private CategoryResponse mapToResponse(Category category) {
        CategoryResponse response = new CategoryResponse();
        response.setId(category.getId());
        response.setName(category.getName());
        response.setIcon(category.getIcon());
        
        List<String> subcategories = category.getSubcategories();
        response.setSubcategories(subcategories);
        response.setSubcategoriesCount(subcategories != null ? subcategories.size() : 0);
        
        response.setActive(category.isActive());
        response.setCreatedAt(category.getCreatedAt());
        response.setUpdatedAt(category.getUpdatedAt());
        return response;
    }
}
