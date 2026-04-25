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