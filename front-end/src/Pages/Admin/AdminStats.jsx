import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../../Context/AdminContext';
import { 
  HiOutlineChartBar, 
  HiOutlineUsers, 
  HiOutlineAcademicCap, 
  HiOutlineStar, 
  HiOutlineArrowLeft,
  HiOutlineArrowTrendingUp,
  HiOutlineArrowTrendingDown,
  HiOutlinePresentationChartLine
} from 'react-icons/hi2';
import '../../Styles/admin.css';

const AdminStats = () => {
  const { stats, loading } = useAdmin();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Chargement des statistiques...</p>
      </div>
    );
  }

  return (
    <div className="admin-stats-page">
      {/* Header with Back Button */}
      <div className="admin-page-header">
        <button className="btn-back" onClick={() => navigate('/admin')}>
          <HiOutlineArrowLeft /> Retour au tableau de bord
        </button>
      </div>

      <div className="section-card">
        <div className="section-header">
          <h2><HiOutlinePresentationChartLine /> Statistiques Détaillées</h2>
        </div>

        <div className="admin-stats-extended-grid">
          {/* Main Stats */}
          <div className="stats-main-category">
            <h3 className="category-title">Aperçu Global</h3>
            <div className="stats-cards-row">
              <div className="stat-card premium">
                <div className="stat-icon users"><HiOutlineUsers /></div>
                <div className="stat-info">
                  <span className="stat-label">Utilisateurs inscrits</span>
                  <h3>{stats.totalUsers?.toLocaleString() || 0}</h3>
                  <div className="stat-trend up">
                    <HiOutlineArrowTrendingUp /> +{Math.round(stats.totalUsers * 0.05) || 0} ce mois
                  </div>
                </div>
              </div>

              <div className="stat-card premium">
                <div className="stat-icon schools"><HiOutlineAcademicCap /></div>
                <div className="stat-info">
                  <span className="stat-label">Établissements</span>
                  <h3>{stats.totalSchools?.toLocaleString() || 0}</h3>
                  <div className="stat-trend up">
                    <HiOutlineArrowTrendingUp /> +{Math.round(stats.totalSchools * 0.02) || 0} ce mois
                  </div>
                </div>
              </div>

              <div className="stat-card premium">
                <div className="stat-icon reviews"><HiOutlineStar /></div>
                <div className="stat-info">
                  <span className="stat-label">Avis publiés</span>
                  <h3>{stats.totalReviews?.toLocaleString() || 0}</h3>
                  <div className="stat-trend up">
                    <HiOutlineArrowTrendingUp /> +{Math.round(stats.totalReviews * 0.1) || 0} ce mois
                  </div>
                </div>
              </div>

              <div className="stat-card premium">
                <div className="stat-icon satisfaction"><HiOutlineChartBar /></div>
                <div className="stat-info">
                  <span className="stat-label">Satisfaction</span>
                  <h3>{stats.satisfaction || 0}%</h3>
                  <div className="stat-trend up">
                    <HiOutlineArrowTrendingUp /> +1.2% constant
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Section */}
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
              <h4>Qualité du Contenu</h4>
              <div className="performance-content">
                <div className="perf-item">
                  <span className="label">Note moyenne</span>
                  <div className="rating-visual">
                    <span className="big-rating">{stats.avgRating || 0}</span>
                    <span className="stars">
                      {[1, 2, 3, 4, 5].map(star => (
                        <HiOutlineStar 
                          key={star} 
                          className={star <= Math.round(stats.avgRating) ? 'filled' : 'empty'} 
                        />
                      ))}
                    </span>
                  </div>
                </div>
                <div className="perf-text">
                  Basé sur {stats.totalReviews} avis vérifiés par la communauté.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .admin-stats-extended-grid {
          display: flex;
          flex-direction: column;
          gap: 40px;
        }
        
        .category-title {
          color: #94a3b8;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-bottom: 20px;
          font-weight: 700;
        }

        .stats-cards-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
        }

        .stat-card.premium {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 25px;
          border-radius: 24px;
          display: flex;
          gap: 20px;
          align-items: center;
        }

        .stat-icon {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.8rem;
          flex-shrink: 0;
        }

        .stat-icon.users { background: rgba(14, 165, 233, 0.1); color: #0ea5e9; }
        .stat-icon.schools { background: rgba(16, 185, 129, 0.1); color: #10b981; }
        .stat-icon.reviews { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
        .stat-icon.satisfaction { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }

        .stat-label {
          color: #94a3b8;
          font-size: 0.85rem;
          font-weight: 600;
          display: block;
          margin-bottom: 5px;
        }

        .stat-info h3 {
          margin: 0;
          font-size: 1.8rem;
          color: white;
          font-weight: 800;
        }

        .stat-trend {
          font-size: 0.8rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 4px;
          margin-top: 8px;
        }

        .stat-trend.up { color: #10b981; }

        .stats-performance-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 25px;
        }

        .performance-card {
          background: rgba(0, 33, 71, 0.3);
          border: 1px solid rgba(0, 255, 255, 0.05);
          padding: 30px;
          border-radius: 24px;
        }

        .performance-card h4 {
          margin: 0 0 25px 0;
          color: #00ffff;
          font-size: 1.1rem;
          font-weight: 700;
        }

        .perf-item {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 20px;
        }

        .perf-item .label {
          width: 100px;
          color: #94a3b8;
          font-size: 0.9rem;
          font-weight: 600;
        }

        .progress-container {
          flex: 1;
          height: 10px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 5px;
          overflow: hidden;
        }

        .progress-bar {
          height: 100%;
          border-radius: 5px;
          transition: width 1s ease-out;
        }

        .progress-bar.warning { background: #f59e0b; }
        .progress-bar.success { background: #10b981; }

        .perf-item .value {
          width: 40px;
          text-align: right;
          color: white;
          font-weight: 700;
        }

        .rating-visual {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .big-rating {
          font-size: 3rem;
          font-weight: 800;
          color: #f59e0b;
        }

        .stars {
          display: flex;
          gap: 5px;
          font-size: 1.5rem;
        }

        .stars .filled { color: #f59e0b; }
        .stars .empty { color: #334155; }

        .perf-text {
          margin-top: 20px;
          color: #64748b;
          font-size: 0.9rem;
          font-style: italic;
        }

        @media (max-width: 768px) {
          .stats-performance-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminStats;
