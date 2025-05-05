import React from 'react';
import CategoryManager from '../features/categories/CategoryManager';
import ProductManager from '../features/products/ProductManager';
import AdminHeader from '../components/AdminHeader';
import './Admin.css';

function Admin() {
  return (
    <>
      <AdminHeader />

      <div className="admin-container">
        <h1 className="admin-title">Quản lý Sản phẩm & Danh mục</h1>

        <div className="admin-grid">
          <div className="admin-section">
            <CategoryManager />
          </div>
          <div className="admin-section">
            <ProductManager />
          </div>
        </div>
      </div>
    </>
  );
}

export default Admin;
