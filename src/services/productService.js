import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const productService = {
  getAllProducts: async () => {
    const response = await axios.get(`${API_URL}/products`);
    return response.data;
  },

  getProductById: async (id) => {
    const response = await axios.get(`${API_URL}/products/${id}`);
    return response.data;
  },

  getProductsByCategory: async (category) => {
    const response = await axios.get(`${API_URL}/products/category/${category}`);
    return response.data;
  },

  searchProducts: async (query) => {
    const response = await axios.get(`${API_URL}/products/search?q=${query}`);
    return response.data;
  }
}; 