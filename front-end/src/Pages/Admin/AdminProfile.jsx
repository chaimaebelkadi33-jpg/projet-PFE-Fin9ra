import React, { useState } from 'react';
import { useAuth } from '../../Context/AuthContext';
import { updateProfile, updatePassword } from '../../Services/api';
import { 
  HiOutlineUser, 
  HiOutlineEnvelope, 
  HiOutlineLockClosed, 
  HiOutlineCalendarDays, 
  HiOutlineShieldCheck,
  HiOutlineCheckCircle,
  HiOutlineExclamationTriangle
} from 'react-icons/hi2';
import '../../Styles/admin.css';

const AdminProfile = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');

    try {
      const response = await updateProfile(profileData);
      if (response.data.success) {
        setSuccess('Profil mis à jour avec succès');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.password !== passwordData.password_confirmation) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);
    setSuccess('');
    setError('');

    try {
      const response = await updatePassword(passwordData);
      if (response.data.success) {
        setSuccess('Mot de passe mis à jour avec succès');
        setPasswordData({
          current_password: '',
          password: '',
          password_confirmation: '',
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Mot de passe actuel incorrect');
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  return (
    <div className="admin-profile-container">
      {/* Alert Messages */}
      {success && (
        <div className="alert-success">
          <HiOutlineCheckCircle /> {success}
        </div>
      )}
      {error && (
        <div className="alert-error">
          <HiOutlineExclamationTriangle /> {error}
        </div>
      )}

      <div className="admin-profile-grid">
        {/* Left Column: User Overview */}
        <div className="profile-overview">
          <div className="section-card profile-card">
            <div className="profile-avatar-container">
              <div className="profile-avatar">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="profile-status-badge">Admin</div>
            </div>
            
            <div className="profile-info-header">
              <h2>{user?.name}</h2>
              <p><HiOutlineEnvelope /> {user?.email}</p>
            </div>

            <div className="profile-meta">
              <div className="meta-item">
                <span className="meta-label">Rôle</span>
                <span className="meta-value"><HiOutlineShieldCheck /> Administrateur</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Membre depuis</span>
                <span className="meta-value">
                  <HiOutlineCalendarDays /> {new Date(user?.created_at).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Update Forms */}
        <div className="profile-actions-column">
          {/* Personal Information Form */}
          <div className="section-card">
            <div className="section-header">
              <h2><HiOutlineUser /> Informations personnelles</h2>
            </div>
            <form onSubmit={handleProfileSubmit} className="form-grid">
              <div className="form-group">
                <label>Nom complet</label>
                <div className="input-with-icon">
                  <HiOutlineUser className="input-icon" />
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                    placeholder="Votre nom"
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Adresse e-mail</label>
                <div className="input-with-icon">
                  <HiOutlineEnvelope className="input-icon" />
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    placeholder="votre@email.com"
                    required
                  />
                </div>
              </div>
              <button type="submit" className="btn-add" disabled={loading}>
                {loading ? 'Mise à jour...' : 'Sauvegarder les modifications'}
              </button>
            </form>
          </div>

          {/* Password Update Form */}
          <div className="section-card" style={{ marginTop: '25px' }}>
            <div className="section-header">
              <h2><HiOutlineLockClosed /> Sécurité</h2>
            </div>
            <form onSubmit={handlePasswordSubmit} className="form-grid">
              <div className="form-group">
                <label>Mot de passe actuel</label>
                <div className="input-with-icon">
                  <HiOutlineLockClosed className="input-icon" />
                  <input
                    type="password"
                    value={passwordData.current_password}
                    onChange={(e) => setPasswordData({...passwordData, current_password: e.target.value})}
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Nouveau mot de passe</label>
                <div className="input-with-icon">
                  <HiOutlineLockClosed className="input-icon" />
                  <input
                    type="password"
                    value={passwordData.password}
                    onChange={(e) => setPasswordData({...passwordData, password: e.target.value})}
                    placeholder="Min. 8 caractères"
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Confirmer le nouveau mot de passe</label>
                <div className="input-with-icon">
                  <HiOutlineLockClosed className="input-icon" />
                  <input
                    type="password"
                    value={passwordData.password_confirmation}
                    onChange={(e) => setPasswordData({...passwordData, password_confirmation: e.target.value})}
                    placeholder="Confirmez"
                    required
                  />
                </div>
              </div>
              <button type="submit" className="btn-add" disabled={loading}>
                {loading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;