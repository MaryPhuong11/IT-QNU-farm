//Để tạo và quản lý trạng thái và lifecycle trong component React.
import React, { useState, useEffect } from 'react';
import { FaPlus } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import './Admin.css';

// Components
//thanh menu bên cạnh
import Sidebar from './components/Common/Sidebar';
import ProductList from './components/Products/ProductList';
import ProductForm from './components/Products/ProductForm';
import CategoryList from './components/Categories/CategoryList';
import CategoryForm from './components/Categories/CategoryForm';
import DeleteModal from './components/Common/DeleteModal';

const API_URL = 'http://localhost:5000/api';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState('');

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/products`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories');
    }
  };

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setShowProductModal(true);
  };

  const handleAddCategory = () => {
    setSelectedCategory(null);
    setShowCategoryModal(true);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  const handleEditCategory = (category) => {
    setSelectedCategory(category);
    setShowCategoryModal(true);
  };

  const handleDeleteClick = (item, type) => {
    setItemToDelete(item);
    setDeleteType(type);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      if (deleteType === 'product') {
        await axios.delete(`${API_URL}/products/${itemToDelete.id}`);
        toast.success('Product deleted successfully');
        fetchProducts();
      } else {
        await axios.delete(`${API_URL}/categories/${itemToDelete.id}`);
        toast.success('Category deleted successfully');
        fetchCategories();
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    } finally {
      setShowDeleteModal(false);
      setItemToDelete(null);
      setDeleteType('');
    }
  };

  const handleProductSubmit = async (formData) => {
    try {
      if (selectedProduct) {
        //them san pham
        await axios.put(`${API_URL}/products/${selectedProduct.id}`, formData);
        toast.success('Product updated successfully');
      } else {
        //cap nhat sản pham
        await axios.post(`${API_URL}/products`, formData);
        toast.success('Product added successfully');
      }
      //cập nhật lại ds
      fetchProducts();
      //Đóng modal them hoặc xoá
      setShowProductModal(false);
      //Reset giá trị của selectedProduct về null, vì thao tác đã hoàn thành
      setSelectedProduct(null);
    } catch (error) {
      //xử lý lỗi
      console.error('Error saving product:', error);
      toast.error('Operation failed');
    }
  };

  const handleCategorySubmit = async (formData) => {
    try {
      if (selectedCategory) {
        await axios.put(`${API_URL}/categories/${selectedCategory.id}`, formData);
        toast.success('Category updated successfully');
      } else {
        await axios.post(`${API_URL}/categories`, formData);
        toast.success('Category added successfully');
      }
      fetchCategories();
      setShowCategoryModal(false);
      setSelectedCategory(null);
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('Operation failed');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'products':
        return (
          <div className="products-page">
            <div className="page-header">
              <h2>Product Management</h2>
              <button className="btn-primary" onClick={handleAddProduct}>
                <FaPlus /> Add New Product
              </button>
            </div>
            <ProductList
              products={products}
              onEdit={handleEditProduct}
              onDelete={handleDeleteClick}
              isLoading={isLoading}
            />
          </div>
        );

      case 'categories':
        return (
          <div className="categories-page">
            <div className="page-header">
              <h2>Category Management</h2>
              <button className="btn-primary" onClick={handleAddCategory}>
                <FaPlus /> Add New Category
              </button>
            </div>
            <CategoryList
              categories={categories}
              onEdit={handleEditCategory}
              onDelete={handleDeleteClick}
            />
          </div>
        );

      case 'orders':
        return (
          <div className="orders-page">
            <h2>Orders Management</h2>
            <p>Coming soon...</p>
          </div>
        );

      case 'users':
        return (
          <div className="users-page">
            <h2>Users Management</h2>
            <p>Coming soon...</p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="admin-container">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="admin-content">
        <header className="content-header">
          <h1>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
          <div className="user-profile">
            <img src="https://via.placeholder.com/40" alt="Admin" />
            <span>Admin User</span>
          </div>
        </header>
        <main className="content-main">
          {renderContent()}
        </main>
      </div>

      {showProductModal && (
        <ProductForm
          isOpen={showProductModal}
          onClose={() => {
            setShowProductModal(false);
            setSelectedProduct(null);
          }}
          onSubmit={handleProductSubmit}
          product={selectedProduct}
          categories={categories}
        />
      )}

      {showCategoryModal && (
        <CategoryForm
          isOpen={showCategoryModal}
          onClose={() => {
            setShowCategoryModal(false);
            setSelectedCategory(null);
          }}
          onSubmit={handleCategorySubmit}
          category={selectedCategory}
        />
      )}

      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setItemToDelete(null);
          setDeleteType('');
        }}
        onConfirm={handleDeleteConfirm}
        itemName={itemToDelete?.name || itemToDelete?.productName}
        type={deleteType}
      />
    </div>
  );
};

export default Admin; 