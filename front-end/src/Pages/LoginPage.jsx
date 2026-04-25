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
        navigate('/');
    } else {
        setError(result.error);
    }
    setLoading(false);
};

  return ( 
    <div className="login-page-container">
    
      <div className="login-page-header">
        <h1 className="login-page-title">FinN9ra?</h1>
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