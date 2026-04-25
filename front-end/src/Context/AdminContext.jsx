import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { adminGetStats } from '../Services/api';

const AdminContext = createContext();

export const useAdmin = () => useContext(AdminContext);

export const AdminProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSchools: 0,
    totalReviews: 0,
    pendingReviews: 0,
    satisfaction: 0,
    avgRating: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && user?.is_admin) {
      setIsAdmin(true);
      loadAdminStats();
    } else {
      setIsAdmin(false);
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const loadAdminStats = async () => {
    try {
      const response = await adminGetStats();
      if (response.data && response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error loading admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    isAdmin,
    stats,
    loading,
    refreshStats: loadAdminStats
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};