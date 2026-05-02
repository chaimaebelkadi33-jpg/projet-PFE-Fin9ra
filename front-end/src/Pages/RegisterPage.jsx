import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import "../Styles/RegisterPage.css";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Effacer l'erreur de ce champ quand l'utilisateur commence à taper
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation simple
    if (formData.password !== formData.password_confirmation) {
      setErrors({
        ...errors,
        password_confirmation: "Les mots de passe ne correspondent pas / كلمات المرور غير متطابقة"
      });
      return;
    }

    setLoading(true);
    setErrors({});

    // Appel à l'API d'inscription
    const result = await register(
      formData.name,
      formData.email,
      formData.password,
      formData.password_confirmation
    );
    
    if (result.success) {
      navigate('/');
    } else {
      setErrors(result.error || { general: "Erreur lors de l'inscription" });
    }
    
    setLoading(false);
  };

  return (
    <div className="register-container">
      {/* HEADER: FRANÇAIS À GAUCHE, ARABE À DROITE */}
      <div className="register-header">
        <h1 className="project-title">?FinN9ra</h1>
        <div className="register-subtitle">
          <span className="register-french">Inscription</span>
          <span className="register-separator">/</span>
          <span className="register-arabic">تسجيل</span>
        </div>
      </div>

      {/* AFFICHAGE DES ERREURS GÉNÉRALES */}
      {errors.general && (
        <div className="register-error">
          {errors.general}
        </div>
      )}

      <form onSubmit={handleSubmit} className="register-form">
        {/* Nom complet */}
        <div className="input-group">
          <label htmlFor="name">Nom complet / الاسم الكامل</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Entrez votre nom complet / ادخل اسمك الكامل"
            required
            disabled={loading}
          />
          {errors.name && <span className="register-field-error">{errors.name}</span>}
        </div>

        {/* Email */}
        <div className="input-group">
          <label htmlFor="email">Email / البريد الإلكتروني</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Entrez votre email / ادخل بريدك الإلكتروني"
            required
            disabled={loading}
          />
          {errors.email && <span className="register-field-error">{errors.email}</span>}
        </div>

        {/* Mot de passe */}
        <div className="input-group">
          <label htmlFor="password">Mot de passe / كلمة المرور</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Entrez votre mot de passe / ادخل كلمة المرور"
            minLength="8"
            required
            disabled={loading}
          />
          {errors.password && <span className="register-field-error">{errors.password}</span>}
        </div>

        {/* Confirmation mot de passe */}
        <div className="input-group">
          <label htmlFor="password_confirmation">
            Confirmer le mot de passe / تأكيد كلمة المرور
          </label>
          <input
            type="password"
            id="password_confirmation"
            name="password_confirmation"
            value={formData.password_confirmation}
            onChange={handleChange}
            placeholder="Confirmez votre mot de passe / أعد إدخال كلمة المرور"
            minLength="8"
            required
            disabled={loading}
          />
          {errors.password_confirmation && <span className="register-field-error">{errors.password_confirmation}</span>}
        </div>

        {/* Bouton */}
        <button type="submit" className="register-button" disabled={loading}>
          {loading ? "Inscription en cours..." : "S'inscrire / تسجيل"}
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
          S'inscrire avec Google
        </button>
      </form>

      {/* Section Login */}
      <div className="login-section">
        <p className="login-text">
          Vous avez déjà un compte ?<br />
          لديك حساب بالفعل؟
        </p>
        <Link to="/login" className="login-link">
          Se connecter / تسجيل الدخول
        </Link>
      </div>
    </div>
  );
};

export default RegisterPage;