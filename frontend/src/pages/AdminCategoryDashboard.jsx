import React, { useState, useEffect } from 'react';
import categoryService from '../services/categoryService';
import CategoryTable from '../components/categories/admin/CategoryTable';
import CategorySlideOut from '../components/categories/admin/CategorySlideOut';
import styles from './AdminCategoryDashboard.module.css';

const AdminCategoryDashboard = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSlideOutOpen, setIsSlideOutOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      // Fetching all categories using the public or admin endpoint depending on your backend
      const data = await categoryService.getAllCategories().catch(() => []);
      
      const dataArray = Array.isArray(data) 
        ? data 
        : (data?.content || data?.data || data?.categories || []);
        
      setCategories(dataArray);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddNew = () => {
    setEditingCategory(null);
    setIsSlideOutOpen(true);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setIsSlideOutOpen(true);
  };

  const handleDelete = async (category) => {
    if (window.confirm(`Are you sure you want to delete ${category.name}?`)) {
      if (!category.id) {
        alert("Cannot delete a category without an ID. Please refresh the page.");
        return;
      }
      try {
        await categoryService.deleteCategory(category.id);
        setCategories(prev => prev.filter(c => c.id !== category.id));
      } catch (error) {
        console.error('Error deleting category:', error);
        alert('Failed to delete category.');
      }
    }
  };

  const handleToggleStatus = async (category) => {
    if (!category.id) {
      alert("Cannot toggle a category without an ID. Please refresh the page.");
      return;
    }
    const newStatus = category.active === false ? true : false;
    
    // Optimistically update
    setCategories(prev => prev.map(c => 
      c.id === category.id ? { ...c, active: newStatus } : c
    ));
    
    try {
      await categoryService.toggleCategoryStatus(category.id, newStatus);
    } catch (error) {
      console.error('Error toggling status:', error);
      alert('Failed to toggle status.');
      // Revert on failure
      setCategories(prev => prev.map(c => 
        c.id === category.id ? { ...c, active: !newStatus } : c
      ));
    }
  };

  const handleSave = async (formData) => {
    try {
      if (editingCategory) {
        // Update
        const response = await categoryService.updateCategory(editingCategory.id, formData);
        setCategories(prev => prev.map(c => 
          c.id === editingCategory.id ? response : c
        ));
      } else {
        // Create
        const response = await categoryService.createCategory(formData);
        setCategories(prev => [...prev, response]);
      }
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Failed to save category.');
    } finally {
      setIsSlideOutOpen(false);
      setEditingCategory(null);
    }
  };

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.pageTitle}>Service Categories</h1>
          <p className={styles.pageSubtitle}>Manage core marketplace service listings and subcategories</p>
        </div>
        <button className={styles.addBtn} onClick={handleAddNew}>
          + Add New Category
        </button>
      </div>

      <div className={styles.tableWrapper}>
        {loading ? (
          <div className={styles.loading}>Loading categories...</div>
        ) : (
          <CategoryTable 
            categories={categories} 
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleStatus={handleToggleStatus}
          />
        )}
      </div>

      <CategorySlideOut 
        isOpen={isSlideOutOpen} 
        onClose={() => setIsSlideOutOpen(false)} 
        onSave={handleSave}
        category={editingCategory}
      />
    </div>
  );
};

export default AdminCategoryDashboard;
