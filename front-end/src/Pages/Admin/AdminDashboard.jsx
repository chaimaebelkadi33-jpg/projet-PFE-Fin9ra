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
import '../../Styles/adminDashboard.css';

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

  const currentDate = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="admin-dashboard">
      {/* 3 Main Clickable Stats Cards */}
      <div className="admin-stats">
        <div className="stat-card clickable" onClick={() => navigate('/admin/users')}>
          <div className="stat-icon users"><HiOutlineUsers /></div>
          <div className="stat-info">
            <h3>{stats.totalUsers?.toLocaleString() || 0}</h3>
            <p>Utilisateurs</p>
          </div>
          <div className="stat-arrow">→</div>
        </div>

        <div className="stat-card clickable" onClick={() => navigate('/admin/schools')}>
          <div className="stat-icon schools"><HiOutlineAcademicCap /></div>
          <div className="stat-info">
            <h3>{stats.totalSchools?.toLocaleString() || 0}</h3>
            <p>Écoles</p>
          </div>
          <div className="stat-arrow">→</div>
        </div>

        <div className="stat-card clickable" onClick={() => navigate('/admin/reviews')}>
          <div className="stat-icon reviews"><HiOutlineStar /></div>
          <div className="stat-info">
            <h3>{stats.totalReviews?.toLocaleString() || 0}</h3>
            <p>Avis</p>
            {pendingReviews > 0 && (
              <span className="stat-badge">{pendingReviews} en attente</span>
            )}
          </div>
          <div className="stat-arrow">→</div>
        </div>
      </div>

      {/* Detailed Stats Section */}
      <div className="dashboard-details-section">
        <div className="section-header">
          <h2>
            <span className="title-left">
              <HiOutlinePresentationChartLine /> Performance de la plateforme
            </span>
            <span className="current-date-dashboard">{currentDate}</span>
          </h2>
        </div>

        <div className="stats-performance-grid">
          <div className="performance-card">
            <h4>Modération des Avis</h4>
            <div className="performance-content">
              <div className="perf-item">
                <span className="label">En attente</span>
                <div className="progress-container">
                  <div className="progress-bar warning" style={{ width: `${Math.min(100, (stats.pendingReviews / (stats.totalReviews || 1)) * 100)}%` }}></div>
                </div>
                <span className="value">{stats.pendingReviews}</span>
              </div>
              <div className="perf-item">
                <span className="label">Traités</span>
                <div className="progress-container">
                  <div className="progress-bar success" style={{ width: `${Math.max(0, 100 - (stats.pendingReviews / (stats.totalReviews || 1)) * 100)}%` }}></div>
                </div>
                <span className="value">{stats.totalReviews - stats.pendingReviews}</span>
              </div>
            </div>
          </div>

          <div className="performance-card">
            <h4>Qualité & Satisfaction</h4>
            <div className="performance-content">
              <div className="perf-item">
                <span className="label">Note moyenne</span>
                <div className="rating-visual">
                  <span className="big-rating">{stats.avgRating || 0}</span>
                  <div className="stars-container">
                    <span className="stars">
                      {[1, 2, 3, 4, 5].map(star => (
                        <HiOutlineStar 
                          key={star} 
                          className={star <= Math.round(stats.avgRating) ? 'filled' : 'empty'} 
                        />
                      ))}
                    </span>
                    <span className="satisfaction-text">{stats.satisfaction || 0}% de satisfaction</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Breakdown Sections */}
        <div className="breakdown-grid">
          <div className="breakdown-card">
            <h4>Nombre d'écoles par ville</h4>
            <div className="breakdown-list">
              {stats.schoolsByCity?.map((item, index) => (
                <div key={index} className="breakdown-item">
                  <span className="item-name" style={{ textTransform: 'capitalize' }}>{item.ville?.toLowerCase()}</span>
                  <div className="item-track">
                    <div className="item-bar" style={{ width: `${(item.total / stats.totalSchools) * 100}%` }}></div>
                  </div>
                  <span className="item-count">{item.total}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="breakdown-card">
            <h4>Nombre d'écoles par type</h4>
            <div className="breakdown-list">
              {stats.schoolsByType?.map((item, index) => (
                <div key={index} className="breakdown-item">
                  <span className="item-name" style={{ textTransform: 'capitalize' }}>{item.type?.toLowerCase()}</span>
                  <div className="item-track">
                    <div className="item-bar type-bar" style={{ width: `${(item.total / stats.totalSchools) * 100}%` }}></div>
                  </div>
                  <span className="item-count">{item.total}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;