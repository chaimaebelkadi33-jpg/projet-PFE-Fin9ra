import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ToastProvider } from "./Components/Toast";
import "./Styles/global.css";

// Import Components
import Header from "./Components/Header";
import Footer from "./Components/Footer";
import EcoleDetails from "./Pages/EcoleDetail";
import About from "./Components/About";

// Import Pages
import Accueil from "./Pages/Accueil";
import Ecoles from "./Pages/Ecoles";
import ContactPage from "./Components/ContactPage";
import LoginPage from "./Pages/LoginPage";
import RegisterPage from "./Pages/RegisterPage";
import PageError from "./Components/PageError";
import AdminDashboard from "./Pages/Admin/AdminDashboard";
import AdminSchools from "./Pages/Admin/AdminSchools";
import AdminReviews from "./Pages/Admin/AdminReviews";
import AdminUsers from "./Pages/Admin/AdminUsers";
import AdminStats from "./Pages/Admin/AdminStats";
import AdminProfile from "./Pages/Admin/AdminProfile";
import AdminNotifications from "./Pages/Admin/AdminNotifications";
import AdminSettings from "./Pages/Admin/AdminSettings";

import { AdminProvider } from "./Context/AdminContext";
import { AuthProvider, useAuth } from "./Context/AuthContext";
import AdminSidebar from "./Components/Admin/AdminSidebar";
import { HiOutlineHandRaised, HiOutlineCalendarDays } from "react-icons/hi2";
import "./Styles/adminLayout.css";

// Composant pour protéger les routes admin
const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated || !user?.is_admin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Layout pour admin avec sidebar ENTRE header et footer
// Layout pour admin
const AdminLayoutWrapper = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  
  // Titre dynamique basé sur la route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/admin') return 'Tableau de bord';
    if (path.includes('/profile')) return 'Mon Profil';
    if (path.includes('/schools')) return 'Gestion des Écoles';
    if (path.includes('/reviews')) return 'Gestion des Avis';
    if (path.includes('/users')) return 'Gestion des Utilisateurs';
    if (path.includes('/stats')) return 'Statistiques';
    if (path.includes('/notifications')) return 'Notifications';
    if (path.includes('/settings')) return 'Paramètres';
    return 'Administration';
  };
  
  const currentDate = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="admin-app">
      <Header />
      <div className="admin-body-container">
        <AdminSidebar />
        <div className="admin-content-wrapper">
          <div className="admin-header-info">
            <div className="admin-header-left">
              <h1>{getPageTitle()}</h1>
              <p className="admin-welcome">
                Bienvenue, {user?.name} <HiOutlineHandRaised className="welcome-icon" />
              </p>
            </div>
            <div className="admin-header-right">
              <div className="admin-date">
                <HiOutlineCalendarDays className="date-icon" />
                {currentDate}
              </div>
            </div>
          </div>
          <div className="admin-content-area">
            {children}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

// Composant principal avec les providers
function AppContent() {
  const { isAuthenticated, user } = useAuth();
  const isAdmin = isAuthenticated && user?.is_admin;

  // Si l'utilisateur est admin, afficher avec sidebar + header + footer
  if (isAdmin) {
    return (
      <AdminProvider>
        <AdminLayoutWrapper>
          <Routes>
            <Route path="/" element={<Accueil />} />
            <Route path="/ecoles" element={<Ecoles />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/About" element={<About />} />
            <Route path="/ecole/:id" element={<EcoleDetails />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Routes Admin */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/schools" element={<AdminSchools />} />
            <Route path="/admin/reviews" element={<AdminReviews />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/stats" element={<AdminStats />} />
            <Route path="/admin/profile" element={<AdminProfile />} />
            <Route path="/admin/notifications" element={<AdminNotifications />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            
            <Route path="*" element={<PageError />} />
          </Routes>
        </AdminLayoutWrapper>
      </AdminProvider>
    );
  }

  // Utilisateur normal (non admin)
  return (
    <div className="App">
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Accueil />} />
          <Route path="/ecoles" element={<Ecoles />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/About" element={<About />} />
          <Route path="/ecole/:id" element={<EcoleDetails />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<PageError />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;