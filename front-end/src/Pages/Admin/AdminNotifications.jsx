import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminGetPendingReviews } from '../../Services/api';
import { 
  HiOutlineBell, 
  HiOutlineChatBubbleBottomCenterText, 
  HiOutlineExclamationCircle, 
  HiOutlineCheckCircle, 
  HiOutlineClock,
  HiOutlineTrash,
  HiOutlineArrowRight
} from 'react-icons/hi2';
import '../../Styles/admin.css';

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await adminGetPendingReviews();
      
      let reviewsData = [];
      if (response.data && response.data.data) {
        reviewsData = response.data.data;
      } else if (Array.isArray(response.data)) {
        reviewsData = response.data;
      } else if (response.data && response.data.success && response.data.data) {
        reviewsData = response.data.data;
      }

      // Convert reviews to notification objects
      const reviewNotifs = reviewsData.slice(0, 5).map(review => ({
        id: `review-${review.id}`,
        type: 'warning',
        title: 'Nouvel avis à modérer',
        message: `L'utilisateur ${review.user?.name || 'Anonyme'} a laissé un avis sur ${review.school?.nom || 'un établissement'}.`,
        time: new Date(review.created_at).toLocaleDateString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit'
        }),
        unread: true,
        actionLabel: 'Modérer',
        actionPath: '/admin/reviews'
      }));

      // Add dummy system notifications
      const systemNotifs = [
        {
          id: 'sys-1',
          type: 'info',
          title: 'Bienvenue sur le nouveau Dashboard',
          message: 'Profitez de la nouvelle interface premium Oxford Blue et Cyan.',
          time: 'Aujourd\'hui',
          unread: false,
          actionLabel: 'Explorer',
          actionPath: '/admin'
        },
        {
          id: 'sys-2',
          type: 'success',
          title: 'Système à jour',
          message: 'Toutes les fonctionnalités sont opérationnelles et optimisées.',
          time: 'Hier',
          unread: false
        }
      ];

      setNotifications([...reviewNotifs, ...systemNotifs]);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    if (window.confirm('Voulez-vous supprimer toutes les notifications ?')) {
      setNotifications([]);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'warning': return <HiOutlineChatBubbleBottomCenterText />;
      case 'info': return <HiOutlineExclamationCircle />;
      case 'success': return <HiOutlineCheckCircle />;
      default: return <HiOutlineBell />;
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Chargement des notifications...</p>
      </div>
    );
  }

  return (
    <div className="admin-notifications-page">
      <div className="section-card">
        <div className="notifications-header">
          <h2><HiOutlineBell /> Notifications ({notifications.length})</h2>
          {notifications.length > 0 && (
            <button className="btn-clear-all" onClick={clearAll}>
              <HiOutlineTrash /> Tout effacer
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="admin-empty">
            <div className="admin-empty-icon"><HiOutlineBell /></div>
            <p>Aucune notification pour le moment</p>
          </div>
        ) : (
          <div className="notifications-list">
            {notifications.map((notif) => (
              <div 
                key={notif.id} 
                className={`notification-item ${notif.type} ${notif.unread ? 'unread' : ''}`}
                onClick={() => notif.actionPath && navigate(notif.actionPath)}
              >
                <div className="notification-icon-wrapper">
                  {getIcon(notif.type)}
                </div>
                
                <div className="notification-content">
                  <h3 className="notification-title">{notif.title}</h3>
                  <p className="notification-message">{notif.message}</p>
                  
                  <div className="notification-footer">
                    <span className="notification-time">
                      <HiOutlineClock /> {notif.time}
                    </span>
                    
                    {notif.actionLabel && (
                      <button className="btn-notif-action">
                        {notif.actionLabel} <HiOutlineArrowRight />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminNotifications;