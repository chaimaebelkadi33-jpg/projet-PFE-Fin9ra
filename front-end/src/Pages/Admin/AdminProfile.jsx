import React, { useEffect, useState } from 'react';
import { useAuth } from '../../Context/AuthContext';
import { getImageUrl, updateProfile, updatePassword } from '../../Services/api';
import { 
  HiOutlineUser, 
  HiOutlineEnvelope, 
  HiOutlineLockClosed, 
  HiOutlineCalendarDays, 
  HiOutlineShieldCheck,
  HiOutlineCheckCircle,
  HiOutlineExclamationTriangle,
  HiOutlinePencil
} from 'react-icons/hi2';
import '../../Styles/admin.css';

const AdminProfile = () => {
  const { user, setUser } = useAuth();
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar ? getImageUrl(user.avatar) : null);
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;

    setProfileData({
      name: user.name || '',
      email: user.email || '',
    });
    setAvatarPreview(user.avatar ? getImageUrl(user.avatar) : null);
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');

    try {
      const response = await updateProfile(profileData);
      if (response.data.success) {
        if (response.data.user) {
          setUser(response.data.user);
        }
        setSuccess('Profil mis à jour avec succès');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
    setLoading(true);
    setSuccess('');
    setError('');

    try {
      const formData = new FormData();
      formData.append('name', profileData.name || user?.name || '');

      if (!user?.google_id) {
        formData.append('email', profileData.email || user?.email || '');
      }

      formData.append('avatar', file);

      const response = await updateProfile(formData);
      if (response.data.success && response.data.user) {
        setUser(response.data.user);
        setAvatarPreview(getImageUrl(response.data.user.avatar));
        setSuccess('Photo de profil mise a jour');
      }
    } catch (err) {
      setAvatarPreview(user?.avatar ? getImageUrl(user.avatar) : null);
      setError(err.response?.data?.message || "Erreur lors de l'enregistrement de la photo");
    } finally {
      setLoading(false);
      e.target.value = '';
      URL.revokeObjectURL(previewUrl);
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

  const currentDate = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

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
              <label className="profile-avatar admin-avatar-upload" htmlFor="admin-avatar-upload">
                {avatarPreview ? (
                  <img src={avatarPreview} alt={user?.name} className="admin-profile-avatar-img" />
                ) : (
                  user?.name?.charAt(0).toUpperCase()
                )}
                <span className="admin-avatar-edit">
                  <HiOutlinePencil />
                </span>
              </label>
              <input
                id="admin-avatar-upload"
                type="file"
                accept="image/*"
                className="admin-avatar-input"
                onChange={handleAvatarChange}
              />
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
              <h2>
                <span className="title-left">
                  <HiOutlineUser /> Informations personnelles
                </span>
                <span className="current-date-dashboard">{currentDate}</span>
              </h2>
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
