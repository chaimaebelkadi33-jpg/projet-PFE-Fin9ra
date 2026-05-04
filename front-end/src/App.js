import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
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
import AuthCallback from "./Pages/AuthCallback";
import Recommendations from "./Pages/Recommendations";
import PageError from "./Components/PageError";
import AdminDashboard from "./Pages/Admin/AdminDashboard";
import AdminSchools from "./Pages/Admin/AdminSchools";
import AdminReviews from "./Pages/Admin/AdminReviews";
import AdminUsers from "./Pages/Admin/AdminUsers";
import AdminStats from "./Pages/Admin/AdminStats";
import AdminProfile from "./Pages/Admin/AdminProfile";
import AdminNotifications from "./Pages/Admin/AdminNotifications";
import AdminSettings from "./Pages/Admin/AdminSettings";
import AdminFormations from "./Pages/Admin/AdminFormations";

import { AdminProvider } from "./Context/AdminContext";
import { AuthProvider, useAuth } from "./Context/AuthContext";
import AdminSidebar from "./Components/Admin/AdminSidebar";
import "./Styles/adminLayout.css";

import Profile from "./Pages/Profile";

// Composant pour protéger les routes utilisateurs
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null;
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Layout pour admin avec sidebar ENTRE header et footer
// Layout pour admin
const AdminLayoutWrapper = ({ children }) => {
  return (
    <div className="admin-app">
      <Header />
      <div className="admin-body-container">
        <AdminSidebar />
        <div className="admin-content-wrapper">
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
  const { isAuthenticated, user, loading } = useAuth();
  const isAdmin = isAuthenticated && user?.is_admin;

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  // Si l'utilisateur est admin, afficher avec sidebar + header + footer
  if (isAdmin) {
    return (
      <AdminProvider>
        <AdminLayoutWrapper>
          <Routes>
            <Route path="/" element={<Navigate to="/admin" replace />} />
            <Route path="/ecoles" element={<Ecoles />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/About" element={<About />} />
            <Route path="/ecole/:id" element={<EcoleDetails />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/recommendations" element={<Recommendations />} />
            
            {/* Routes Admin */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/schools" element={<AdminSchools />} />
            <Route path="/admin/schools/:schoolId/formations" element={<AdminFormations />} />
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
          <Route 
            path="/recommendations" 
            element={
              <ProtectedRoute>
                <Recommendations />
              </ProtectedRoute>
            } 
          />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
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
