import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import { useAdmin } from '../../Context/AdminContext';
import { adminGetPendingReviewsCount } from '../../Services/api';
import { 
  HiOutlineUsers, 
  HiOutlineAcademicCap, 
  HiOutlineStar, 
  HiOutlineChartBar, 
  HiOutlineBuildingLibrary, 
  HiOutlineUserGroup, 
  HiOutlineChatBubbleLeftRight, 
  HiOutlinePresentationChartLine 
} from 'react-icons/hi2';
import '../../Styles/admin.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { stats, loading } = useAdmin();
  const navigate = useNavigate();
  const [pendingReviews, setPendingReviews] = useState(0);

  useEffect(() => {
    loadPendingReviews();
  }, []);

  const loadPendingReviews = async () => {
    try {
      const response = await adminGetPendingReviewsCount();
      if (response.data && response.data.count !== undefined) {
        setPendingReviews(response.data.count);
      } else if (response.data && response.data.data && response.data.data.count !== undefined) {
        setPendingReviews(response.data.data.count);
      }
    } catch (error) {
      console.error('Error loading pending reviews:', error);
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Chargement du tableau de bord...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* 4 Stats Cards */}
      <div className="admin-stats">
        <div className="stat-card">
          <div className="stat-icon"><HiOutlineUsers /></div>
          <div className="stat-info">
            <h3>{stats.totalUsers?.toLocaleString() || 0}</h3>
            <p>Utilisateurs</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><HiOutlineAcademicCap /></div>
          <div className="stat-info">
            <h3>{stats.totalSchools?.toLocaleString() || 0}</h3>
            <p>Écoles</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><HiOutlineStar /></div>
          <div className="stat-info">
            <h3>{stats.totalReviews?.toLocaleString() || 0}</h3>
            <p>Avis</p>
            {pendingReviews > 0 && (
              <span className="stat-badge">{pendingReviews} en attente</span>
            )}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><HiOutlineChartBar /></div>
          <div className="stat-info">
            <h3>{stats.satisfaction || 75}%</h3>
            <p>Taux de satisfaction</p>
          </div>
        </div>
      </div>

      {/* 4 Management Cards (2x2 grid) */}
      <div className="admin-cards-grid">
        <div className="admin-card" onClick={() => navigate('/admin/schools')}>
          <div className="card-icon"><HiOutlineBuildingLibrary /></div>
          <div className="card-content">
            <h3>Gérer les Écoles</h3>
            <p>Ajouter, modifier ou supprimer des établissements</p>
          </div>
          <div className="card-arrow">→</div>
        </div>

        <div className="admin-card" onClick={() => navigate('/admin/users')}>
          <div className="card-icon"><HiOutlineUserGroup /></div>
          <div className="card-content">
            <h3>Gérer les Utilisateurs</h3>
            <p>Gérer les comptes utilisateurs et leurs rôles</p>
          </div>
          <div className="card-arrow">→</div>
        </div>

        <div className="admin-card" onClick={() => navigate('/admin/reviews')}>
          <div className="card-icon"><HiOutlineChatBubbleLeftRight /></div>
          <div className="card-content">
            <h3>Gérer les Avis</h3>
            <p>Modérer et valider les avis des utilisateurs</p>
            {pendingReviews > 0 && (
              <span className="card-badge">{pendingReviews} en attente</span>
            )}
          </div>
          <div className="card-arrow">→</div>
        </div>

        <div className="admin-card" onClick={() => navigate('/admin/stats')}>
          <div className="card-icon"><HiOutlinePresentationChartLine /></div>
          <div className="card-content">
            <h3>Consulter les Statistiques</h3>
            <p>Voir les statistiques détaillées de la plateforme</p>
          </div>
          <div className="card-arrow">→</div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;