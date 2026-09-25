package com.clickcart.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

public class CategoryRequest {

    @NotBlank(message = "Category name is required")
    private String name;

    private String icon;

    private List<String> subcategories;

    private Boolean active;

    public CategoryRequest() {
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public List<String> getSubcategories() {
        return subcategories;
    }

    public void setSubcategories(List<String> subcategories) {
        this.subcategories = subcategories;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}
