import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import '../Styles/LoginPage.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

 const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
        if (result.user.is_admin) {
            navigate('/admin');
        } else {
            navigate('/');
        }
    } else {
        setError(result.error);
    }
    setLoading(false);
};

  return ( 
    <div className="login-page-container">
    
      <div className="login-page-header">
        <h1 className="login-page-title">Bienvenue à FinN9ra?</h1>
        <div className="login-page-subtitle">
          <span className="login-arabic">دخول</span>
          <span className="login-separator">/</span>
          <span className="login-french">Connexion</span>
        </div>
      </div>

      {/* AFFICHAGE DES ERREURS */}
      {error && (
        <div className="login-page-error">
          {error}
        </div>
      )}

      {/* FORMULAIRE */}
      <form onSubmit={handleSubmit} className="login-page-form">
        <div className="login-page-input-group">
          <label className="login-page-label">البريد الإلكتروني / Email</label>
          <input
            type="email"
            className="login-page-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ادخل بريدك الإلكتروني / Entrez votre email"
            required
            disabled={loading}
          />
        </div>

        <div className="login-page-input-group">
          <label className="login-page-label">كلمة المرور / Mot de passe</label>
          <input
            type="password"
            className="login-page-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="ادخل كلمة المرور / Entrez votre mot de passe"
            required
            disabled={loading}
          />
        </div>

        <button type="submit" className="login-page-button" disabled={loading}>
          {loading ? 'Connexion...' : 'تسجيل الدخول / Se connecter'}
        </button>

        <div className="auth-separator">
          <span>أو / Ou</span>
        </div>

        <button 
          type="button" 
          className="google-auth-button" 
          onClick={() => { window.location.href = "http://127.0.0.1:8000/api/auth/google/redirect"; }}
          disabled={loading}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continuer avec Google
        </button>
      </form>

      {/* SECTION INSCRIPTION */}
      <div className="login-page-register-section">
        <p className="login-page-register-text">
          Pas encore inscrit?<br />
          هل أنت جديد؟ سجل هنا
        </p>
        <Link to="/register" className="login-page-register-link">
          التسجيل / S'inscrire
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;