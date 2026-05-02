import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import { adminGetPendingReviewsCount } from '../../Services/api';
import { 
  HiOutlineUser, 
  HiOutlineSquares2X2, 
  HiOutlineBell, 
  HiOutlineCog6Tooth,
  HiOutlineArrowRightOnRectangle,
  HiOutlineBuildingLibrary,
  HiOutlineChatBubbleLeftRight,
  HiOutlineUsers,
  HiOutlineChartBar,
  HiOutlineBars3,
  HiOutlineChevronLeft
} from 'react-icons/hi2';

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [isExpanded, setIsExpanded] = useState(true);
  const [pendingReviewsCount, setPendingReviewsCount] = useState(0);

  useEffect(() => {
    loadPendingReviewsCount();
    const interval = setInterval(loadPendingReviewsCount, 60000); // 1 min
    return () => clearInterval(interval);
  }, []);

  const loadPendingReviewsCount = async () => {
    try {
      const response = await adminGetPendingReviewsCount();
      const count = response.data?.count ?? response.data?.data?.count ?? 0;
      setPendingReviewsCount(count);
    } catch (error) {
      console.error("Error loading pending reviews count:", error);
    }
  };

  const menuItems = [
    { icon: <HiOutlineUser />, label: 'Mon profil', path: '/admin/profile' },
    { icon: <HiOutlineSquares2X2 />, label: 'Dashboard', path: '/admin' },
    { icon: <HiOutlineBuildingLibrary />, label: 'Écoles', path: '/admin/schools' },
    { icon: <HiOutlineUsers />, label: 'Utilisateurs', path: '/admin/users' },
    { icon: <HiOutlineChatBubbleLeftRight />, label: 'Avis', path: '/admin/reviews' },
    { icon: <HiOutlineCog6Tooth />, label: 'Paramètres', path: '/admin/settings' },
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className={`admin-sidebar ${isExpanded ? 'expanded' : ''}`}>
      {/* Bouton de Toggle */}
      <div className="sidebar-toggle-btn" onClick={toggleSidebar}>
        <HiOutlineBars3 />
      </div>

      <div className="sidebar-menu">
        {menuItems.map((item, index) => (
          <div
            key={index}
            className={`sidebar-item ${isActive(item.path) ? 'active' : ''}`}
            onClick={() => handleNavigation(item.path)}
          >
            <div className="sidebar-icon">
              {item.icon}
              {item.badge && <span className="sidebar-badge">{item.badge}</span>}
            </div>
            <div className="sidebar-label">{item.label}</div>
          </div>
        ))}
        
        <div className="sidebar-divider"></div>
        
        <div
          className="sidebar-item logout"
          onClick={handleLogout}
        >
          <div className="sidebar-icon"><HiOutlineArrowRightOnRectangle /></div>
          <div className="sidebar-label">Déconnexion</div>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;