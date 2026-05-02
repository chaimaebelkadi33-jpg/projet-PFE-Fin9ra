import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  adminGetPendingReviews, 
  adminGetReviews, 
  adminVerifyReview, 
  adminDeleteReview 
} from '../../Services/api';
import { 
  HiOutlineChatBubbleLeftRight, 
  HiOutlineCheck, 
  HiOutlineTrash,
  HiStar,
  HiOutlineStar,
  HiOutlineCalendarDays,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineArrowLeft,
  HiOutlineSparkles
} from 'react-icons/hi2';
import '../../Styles/admin.css';
import '../../Styles/adminReviews.css';

const AdminReviews = () => {
  const navigate = useNavigate();
  
  // State
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'all'
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedReviews, setSelectedReviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadReviews();
  }, [currentPage, activeTab]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      setSelectedReviews([]);
      
      const fetchFunction = activeTab === 'pending' ? adminGetPendingReviews : adminGetReviews;
      const response = await fetchFunction(currentPage);
      
      let reviewsData = [];
      let totalPagesData = 1;
      
      // Handle the case where the response is wrapped in { success: true, data: { data: [], last_page: 5 } }
      if (response.data && response.data.success && response.data.data) {
        const paginated = response.data.data;
        if (paginated.data && Array.isArray(paginated.data)) {
          reviewsData = paginated.data;
          totalPagesData = paginated.last_page || 1;
        } else if (Array.isArray(paginated)) {
          reviewsData = paginated;
        }
      } 
      // Handle direct pagination object or array
      else if (response.data) {
        if (response.data.data && Array.isArray(response.data.data)) {
          reviewsData = response.data.data;
          totalPagesData = response.data.last_page || 1;
        } else if (Array.isArray(response.data)) {
          reviewsData = response.data;
        }
      }
      
      setReviews(reviewsData);
      setTotalPages(totalPagesData);
    } catch (error) {
      // If the error is a 404 (Not Found), it often means the list is just empty
      if (error.response && error.response.status === 404) {
        setReviews([]);
        setTotalPages(1);
      } else {
        console.error('Error loading reviews:', error);
        setError('Erreur lors du chargement des avis');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (reviewId) => {
    try {
      setSubmitting(true);
      const response = await adminVerifyReview(reviewId);
      if (response.data && response.data.success) {
        setSuccessMessage('Avis validé avec succès');
        setTimeout(() => setSuccessMessage(''), 3000);
        loadReviews();
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Erreur lors de la validation');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm("⚠️ Supprimer cet avis ? Cette action est irréversible.")) return;
    
    try {
      setSubmitting(true);
      const response = await adminDeleteReview(reviewId);
      if (response.data && response.data.success) {
        setSuccessMessage('Avis supprimé avec succès');
        setTimeout(() => setSuccessMessage(''), 3000);
        loadReviews();
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Erreur lors de la suppression');
    } finally {
      setSubmitting(false);
    }
  };

  // Bulk Actions
  const toggleSelectReview = (id) => {
    setSelectedReviews(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedReviews.length === reviews.length) {
      setSelectedReviews([]);
    } else {
      setSelectedReviews(reviews.map(r => r.id));
    }
  };

  const handleBulkApprove = async () => {
    if (!window.confirm(`Valider les ${selectedReviews.length} avis sélectionnés ?`)) return;
    
    try {
      setSubmitting(true);
      // Sequentially verify selected reviews (or ideally use a bulk API if available)
      for (const id of selectedReviews) {
        await adminVerifyReview(id);
      }
      setSuccessMessage(`${selectedReviews.length} avis validés avec succès`);
      setSelectedReviews([]);
      loadReviews();
    } catch (error) {
      setError('Erreur lors de la validation groupée');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Supprimer définitivement les ${selectedReviews.length} avis sélectionnés ?`)) return;
    
    try {
      setSubmitting(true);
      for (const id of selectedReviews) {
        await adminDeleteReview(id);
      }
      setSuccessMessage(`${selectedReviews.length} avis supprimés avec succès`);
      setSelectedReviews([]);
      loadReviews();
    } catch (error) {
      setError('Erreur lors de la suppression groupée');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<HiStar key={i} className="star-premium full" />);
      } else {
        stars.push(<HiOutlineStar key={i} className="star-premium empty" />);
      }
    }
    return stars;
  };

  const getSentimentClass = (rating) => {
    if (rating >= 4) return 'sentiment-positive';
    if (rating >= 3) return 'sentiment-neutral';
    return 'sentiment-negative';
  };


  const currentDate = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="admin-reviews-page">
      {/* Header with Back Button */}
      <div className="admin-page-header">
        <button className="btn-back" onClick={() => navigate('/admin')}>
          <HiOutlineArrowLeft /> Retour au tableau de bord
        </button>
      </div>

      {successMessage && <div className="alert-success premium">{successMessage}</div>}
      {error && <div className="alert-error premium">{error}</div>}

      <div className="section-card">
        <div className="section-header-moderation">
          <div className="header-top">
            <h2 className="unified-admin-title">
              <span className="title-left">
                <HiOutlineChatBubbleLeftRight /> Modération des Avis
              </span>
              <span className="current-date-dashboard">{currentDate}</span>
            </h2>
            <div className="moderation-tabs">
              <button 
                className={`mod-tab ${activeTab === 'pending' ? 'active' : ''}`}
                onClick={() => { setActiveTab('pending'); setCurrentPage(1); }}
              >
                En attente
              </button>
              <button 
                className={`mod-tab ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => { setActiveTab('all'); setCurrentPage(1); }}
              >
                Tous les avis
              </button>
            </div>
          </div>

          <div className="moderation-toolbar">
            {selectedReviews.length > 0 && (
              <div className="bulk-actions animate-fade-in">
                <span className="selection-count">{selectedReviews.length} sélectionné(s)</span>
                <div className="bulk-btns">
                  {activeTab === 'pending' && (
                    <button className="btn-bulk approve" onClick={handleBulkApprove} disabled={submitting}>
                      <HiOutlineCheck /> Valider tout
                    </button>
                  )}
                  <button className="btn-bulk delete" onClick={handleBulkDelete} disabled={submitting}>
                    <HiOutlineTrash /> Supprimer tout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="admin-loading">
            <div className="spinner"></div>
            <p>Chargement de la file de modération...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="admin-empty">
            <div className="admin-empty-icon"><HiOutlineSparkles /></div>
            <p>Bravo ! La file de modération est vide</p>
          </div>
        ) : (
          <>
            <div className="admin-table-container">
              <table className="admin-table reviews-table">
                <thead>
                  <tr>
                    <th className="checkbox-col">
                      <input 
                        type="checkbox" 
                        checked={selectedReviews.length === reviews.length && reviews.length > 0}
                        onChange={toggleSelectAll}
                      />
                    </th>
                    <th>Utilisateur</th>
                    <th>École</th>
                    <th>Note</th>
                    <th>Commentaire</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((review) => (
                    <tr key={review.id} className={selectedReviews.includes(review.id) ? 'row-selected' : ''}>
                      <td className="checkbox-col">
                        <input 
                          type="checkbox" 
                          checked={selectedReviews.includes(review.id)}
                          onChange={() => toggleSelectReview(review.id)}
                        />
                      </td>
                      <td>
                        <div className="user-profile-mini">
                          <div className="avatar-letter">{review.user?.name?.charAt(0) || '?'}</div>
                          <strong>{review.user?.name || 'Utilisateur'}</strong>
                        </div>
                      </td>
                      <td className="school-name-cell">{review.school?.nom || 'N/A'}</td>
                      <td>
                        <div className={`rating-group ${getSentimentClass(review.rating)}`}>
                          <div className="premium-stars">
                            {renderStars(review.rating)}
                          </div>
                          <span className="rating-badge">{review.rating}/5</span>
                        </div>
                      </td>
                      <td className="comment-cell">
                        <div className="comment-bubble">
                          <p>"{review.comment}"</p>
                        </div>
                      </td>
                      <td>
                        <span className="date-pill">
                          <HiOutlineCalendarDays /> {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="actions-cell">
                        <div className="action-btns-group">
                          {!review.verified && activeTab === 'pending' && (
                            <button 
                              className="btn-action approve" 
                              onClick={() => handleVerify(review.id)}
                              title="Valider l'avis"
                              disabled={submitting}
                            >
                              <HiOutlineCheck />
                            </button>
                          )}
                          <button 
                            className="btn-action delete" 
                            onClick={() => handleDelete(review.id)}
                            title="Supprimer l'avis"
                            disabled={submitting}
                          >
                            <HiOutlineTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="pagination premium">
                <button
                  className="page-btn"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  <HiOutlineChevronLeft />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    className={`page-btn ${currentPage === page ? 'active' : ''}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}
                <button
                  className="page-btn"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  <HiOutlineChevronRight />
                </button>
              </div>
            )}
          </>
        )}
      </div>

    </div>
  );
};

export default AdminReviews;