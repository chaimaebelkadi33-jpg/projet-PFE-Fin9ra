import React from 'react';
import AdminSidebar from './AdminSidebar';
import '../../Styles/adminLayout.css';

const AdminLayout = ({ children }) => {
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main-content">
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;