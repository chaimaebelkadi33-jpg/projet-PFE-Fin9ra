import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminGetSettings, adminUpdateSettings } from '../../Services/api';
import { 
  HiOutlineCog6Tooth, 
  HiOutlineGlobeAlt, 
  HiOutlineEnvelope, 
  HiOutlineServer, 
  HiOutlineArrowLeft,
  HiOutlineCheck,
  HiOutlineChatBubbleLeftRight,
  HiOutlineArrowPath,
  HiOutlineShieldCheck
} from 'react-icons/hi2';
import '../../Styles/admin.css';

const AdminSettings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    general: {},
    contact: {},
    social: {},
    system: {}
  });
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await adminGetSettings();
      if (response.data && response.data.success) {
        setSettings(response.data.data);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      setError('Erreur lors du chargement des paramètres');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (group, key, value) => {
    setSettings(prev => ({
      ...prev,
      [group]: {
        ...prev[group],
        [key]: value
      }
    }));
  };

  const handleSaveGroup = async (group) => {
    try {
      setSaving(true);
      setError(null);
      
      // Sending only the keys of the current group
      const response = await adminUpdateSettings(settings[group]);
      
      if (response.data && response.data.success) {
        setSuccessMessage('Paramètres mis à jour avec succès');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setError('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Chargement des paramètres...</p>
      </div>
    );
  }

  const tabs = [
    { id: 'general', label: 'Général', icon: <HiOutlineGlobeAlt /> },
    { id: 'contact', label: 'Contact', icon: <HiOutlineEnvelope /> },
    { id: 'social', label: 'Réseaux Sociaux', icon: <HiOutlineChatBubbleLeftRight /> },
    { id: 'system', label: 'Système', icon: <HiOutlineServer /> }
  ];

  return (
    <div className="admin-settings-page">
      {/* Header with Back Button */}
      <div className="admin-page-header">
        <button className="btn-back" onClick={() => navigate('/admin')}>
          <HiOutlineArrowLeft /> Retour au tableau de bord
        </button>
      </div>

      <div className="section-card">
        <div className="section-header">
          <h2><HiOutlineCog6Tooth /> Paramètres de la plateforme</h2>
        </div>

        <div className="settings-container">
          {/* Tab Sidebar */}
          <div className="settings-tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`settings-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="settings-content">
            {successMessage && <div className="alert-success mini">{successMessage}</div>}
            {error && <div className="alert-error mini">{error}</div>}

            <div className="settings-tab-pane">
              {activeTab === 'general' && (
                <div className="settings-form">
                  <div className="form-group-premium">
                    <label>Nom du site</label>
                    <input 
                      type="text" 
                      value={settings.general.site_name || ''} 
                      onChange={(e) => handleInputChange('general', 'site_name', e.target.value)}
                    />
                  </div>
                  <div className="form-group-premium">
                    <label>Description (SEO)</label>
                    <textarea 
                      rows="3"
                      value={settings.general.site_description || ''} 
                      onChange={(e) => handleInputChange('general', 'site_description', e.target.value)}
                    />
                  </div>
                  <div className="form-group-premium">
                    <label>Texte du pied de page (Footer)</label>
                    <input 
                      type="text" 
                      value={settings.general.footer_text || ''} 
                      onChange={(e) => handleInputChange('general', 'footer_text', e.target.value)}
                    />
                  </div>
                </div>
              )}

              {activeTab === 'contact' && (
                <div className="settings-form">
                  <div className="form-group-premium">
                    <label>Email de support</label>
                    <input 
                      type="email" 
                      value={settings.contact.contact_email || ''} 
                      onChange={(e) => handleInputChange('contact', 'contact_email', e.target.value)}
                    />
                  </div>
                  <div className="form-group-premium">
                    <label>Téléphone de contact</label>
                    <input 
                      type="text" 
                      value={settings.contact.contact_phone || ''} 
                      onChange={(e) => handleInputChange('contact', 'contact_phone', e.target.value)}
                    />
                  </div>
                  <div className="form-group-premium">
                    <label>Adresse physique</label>
                    <textarea 
                      rows="3"
                      value={settings.contact.contact_address || ''} 
                      onChange={(e) => handleInputChange('contact', 'contact_address', e.target.value)}
                    />
                  </div>
                </div>
              )}

              {activeTab === 'social' && (
                <div className="settings-form">
                  <div className="form-group-premium">
                    <label>Lien Facebook</label>
                    <input 
                      type="url" 
                      value={settings.social.social_facebook || ''} 
                      onChange={(e) => handleInputChange('social', 'social_facebook', e.target.value)}
                    />
                  </div>
                  <div className="form-group-premium">
                    <label>Lien Instagram</label>
                    <input 
                      type="url" 
                      value={settings.social.social_instagram || ''} 
                      onChange={(e) => handleInputChange('social', 'social_instagram', e.target.value)}
                    />
                  </div>
                  <div className="form-group-premium">
                    <label>Lien LinkedIn</label>
                    <input 
                      type="url" 
                      value={settings.social.social_linkedin || ''} 
                      onChange={(e) => handleInputChange('social', 'social_linkedin', e.target.value)}
                    />
                  </div>
                </div>
              )}

              {activeTab === 'system' && (
                <div className="settings-form">
                  <div className="settings-toggle-group">
                    <div className="toggle-info">
                      <h4>Mode Maintenance</h4>
                      <p>Bloque l'accès public au site pendant les mises à jour.</p>
                    </div>
                    <label className="switch-premium">
                      <input 
                        type="checkbox" 
                        checked={settings.system.maintenance_mode === '1'} 
                        onChange={(e) => handleInputChange('system', 'maintenance_mode', e.target.checked ? '1' : '0')}
                      />
                      <span className="slider-round"></span>
                    </label>
                  </div>

                  <div className="settings-toggle-group">
                    <div className="toggle-info">
                      <h4>Inscriptions Publiques</h4>
                      <p>Permet aux nouveaux utilisateurs de créer un compte.</p>
                    </div>
                    <label className="switch-premium">
                      <input 
                        type="checkbox" 
                        checked={settings.system.allow_registration === '1'} 
                        onChange={(e) => handleInputChange('system', 'allow_registration', e.target.checked ? '1' : '0')}
                      />
                      <span className="slider-round"></span>
                    </label>
                  </div>
                </div>
              )}

              <div className="settings-actions">
                <button 
                  className="btn-save-settings" 
                  onClick={() => handleSaveGroup(activeTab)}
                  disabled={saving}
                >
                  {saving ? <HiOutlineArrowPath className="spin" /> : <HiOutlineCheck />}
                  {saving ? 'Sauvegarde...' : 'Enregistrer les modifications'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .settings-container {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 40px;
          min-height: 400px;
          margin-top: 20px;
        }

        .settings-tabs {
          display: flex;
          flex-direction: column;
          gap: 12px;
          border-right: 1px solid rgba(255, 255, 255, 0.05);
          padding-right: 20px;
        }

        .settings-tab-btn {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 16px 20px;
          background: transparent;
          border: 1px solid transparent;
          border-radius: 16px;
          color: #94a3b8;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: left;
        }

        .settings-tab-btn svg {
          font-size: 1.4rem;
        }

        .settings-tab-btn:hover {
          background: rgba(255, 255, 255, 0.03);
          color: #ffffff;
        }

        .settings-tab-btn.active {
          background: rgba(0, 255, 255, 0.08);
          color: #00ffff;
          border-color: rgba(0, 255, 255, 0.1);
        }

        .settings-content {
          position: relative;
        }

        .settings-form {
          display: flex;
          flex-direction: column;
          gap: 25px;
        }

        .form-group-premium {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .form-group-premium label {
          color: #94a3b8;
          font-size: 0.85rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-left: 5px;
        }

        .form-group-premium input, 
        .form-group-premium textarea {
          padding: 16px 20px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          color: white;
          font-size: 1rem;
          outline: none;
          transition: all 0.3s ease;
        }

        .form-group-premium input:focus, 
        .form-group-premium textarea:focus {
          border-color: #00ffff;
          background: rgba(0, 255, 255, 0.02);
          box-shadow: 0 0 15px rgba(0, 255, 255, 0.1);
        }

        .settings-toggle-group {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .toggle-info h4 {
          margin: 0 0 5px 0;
          color: white;
          font-weight: 700;
        }

        .toggle-info p {
          margin: 0;
          color: #64748b;
          font-size: 0.85rem;
        }

        /* Premium Switch */
        .switch-premium {
          position: relative;
          display: inline-block;
          width: 60px;
          height: 32px;
        }

        .switch-premium input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .slider-round {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(255, 255, 255, 0.1);
          transition: .4s;
          border-radius: 34px;
        }

        .slider-round:before {
          position: absolute;
          content: "";
          height: 24px;
          width: 24px;
          left: 4px;
          bottom: 4px;
          background-color: #94a3b8;
          transition: .4s;
          border-radius: 50%;
        }

        input:checked + .slider-round {
          background-color: rgba(0, 255, 255, 0.2);
        }

        input:checked + .slider-round:before {
          transform: translateX(28px);
          background-color: #00ffff;
        }

        .settings-actions {
          margin-top: 40px;
          padding-top: 30px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .btn-save-settings {
          background: #00ffff;
          color: #002147;
          border: none;
          padding: 16px 35px;
          border-radius: 50px;
          font-weight: 800;
          font-size: 1rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .btn-save-settings:hover:not(:disabled) {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0, 255, 255, 0.3);
          background: #33ffff;
        }

        .btn-save-settings:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .alert-success.mini {
          padding: 12px 20px;
          margin: 0 0 20px 0;
          font-size: 0.9rem;
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (max-width: 1000px) {
          .settings-container {
            grid-template-columns: 1fr;
          }
          .settings-tabs {
            flex-direction: row;
            border-right: none;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            padding-right: 0;
            padding-bottom: 20px;
            overflow-x: auto;
          }
          .settings-tab-btn {
            white-space: nowrap;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminSettings;