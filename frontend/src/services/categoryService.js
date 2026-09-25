import axios from 'axios';

const PUBLIC_API_URL = 'http://localhost:8080/api/categories';
const ADMIN_API_URL = 'http://localhost:8080/api/admin/categories';

const categoryService = {
  getAllCategories: async () => {
    try {
      // Often both use the same endpoint depending on the backend, 
      // but we will stick to the public one here for general fetching.
      const response = await axios.get(PUBLIC_API_URL);
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  getAllCategoriesAdmin: async () => {
    try {
      const response = await axios.get(ADMIN_API_URL);
      return response.data;
    } catch (error) {
      console.error('Error fetching admin categories:', error);
      throw error;
    }
  },

  createCategory: async (categoryData) => {
    try {
      const response = await axios.post(ADMIN_API_URL, categoryData);
      return response.data;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  },

  updateCategory: async (id, categoryData) => {
    try {
      const response = await axios.put(`${ADMIN_API_URL}/${id}`, categoryData);
      return response.data;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  },

  deleteCategory: async (id) => {
    try {
      const response = await axios.delete(`${ADMIN_API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  },

  toggleCategoryStatus: async (id, active) => {
    try {
      // This might be a PATCH or PUT depending on your specific Spring Boot implementation
      const response = await axios.patch(`${ADMIN_API_URL}/${id}/toggle-status`, { active });
      return response.data;
    } catch (error) {
      console.error('Error toggling category status:', error);
      throw error;
    }
  }
};

export default categoryService;
