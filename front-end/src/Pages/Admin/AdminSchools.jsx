import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  adminGetSchools, 
  adminDeleteSchool,
  adminCreateSchool,
  adminUpdateSchool
} from '../../Services/api';
import { 
  HiOutlineAcademicCap, 
  HiOutlinePencil, 
  HiOutlineTrash, 
  HiOutlinePlus,
  HiOutlineStar,
  HiOutlineBuildingLibrary,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineMapPin,
  HiOutlineTag,
  HiOutlineDocumentText,
  HiOutlineGlobeAlt,
  HiOutlineEnvelope,
  HiOutlinePhone,
  HiOutlineIdentification,
  HiOutlineClock,
  HiOutlineExclamationTriangle,
  HiOutlineArrowLeft,
  HiOutlinePhoto,
  HiOutlineTrash as HiOutlineTrashIcon
} from 'react-icons/hi2';
import '../../Styles/admin.css';

const AdminSchools = () => {
  const navigate = useNavigate();
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSchool, setEditingSchool] = useState(null);
  
  // Custom Delete Confirmation State
  const [deleteConfirm, setDeleteConfirm] = useState({
    show: false,
    id: null,
    name: ''
  });

  // Logo specifically
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [removeLogo, setRemoveLogo] = useState(false);

  const [formData, setFormData] = useState({
    nom: '',
    ville: '',
    type: '',
    description: '',
    presentation: '',
    dureeEtudes: '',
    diplome: '',
    admission: '',
    siteWeb: '',
    contact: '',
    telephone: '',
    adresse: '',
    note: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadSchools();
  }, [currentPage]);

  const loadSchools = async () => {
    try {
      setLoading(true);
      const response = await adminGetSchools(currentPage);
      
      let schoolsData = [];
      let totalPagesData = 1;
      
      if (response.data && response.data.data) {
        if (response.data.data.data) {
          schoolsData = response.data.data.data;
          totalPagesData = response.data.data.last_page || 1;
        } else {
          schoolsData = response.data.data;
          totalPagesData = response.data.last_page || 1;
        }
      } else if (Array.isArray(response.data)) {
        schoolsData = response.data;
        totalPagesData = 1;
      } else {
        schoolsData = [];
      }
      
      setSchools(schoolsData);
      setTotalPages(totalPagesData);
    } catch (error) {
      console.error('Error loading schools:', error);
      setError('Erreur lors du chargement des écoles');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTrigger = (id, nom) => {
    setDeleteConfirm({
      show: true,
      id,
      name: nom
    });
  };

  const handleConfirmDelete = async () => {
    const { id, name } = deleteConfirm;
    setSubmitting(true);
    setError('');
    
    try {
      const response = await adminDeleteSchool(id);
      if (response.data && response.data.success) {
        setSuccessMessage(`"${name}" a été supprimé avec succès`);
        setTimeout(() => setSuccessMessage(''), 3000);
        setDeleteConfirm({ show: false, id: null, name: '' });
        loadSchools();
      } else {
        setError(response.data?.message || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Error deleting school:', error);
      setError(error.response?.data?.message || 'Erreur lors de la suppression');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nom: '',
      ville: '',
      type: '',
      description: '',
      presentation: '',
      dureeEtudes: '',
      diplome: '',
      admission: '',
      siteWeb: '',
      contact: '',
      telephone: '',
      adresse: '',
      note: ''
    });
    setEditingSchool(null);
    setLogoFile(null);
    setLogoPreview(null);
    setRemoveLogo(false);
    setError('');
  };

  const handleOpenCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEdit = (school) => {
    setEditingSchool(school);
    setFormData({
      nom: school.nom || '',
      ville: school.ville || '',
      type: school.type || '',
      description: school.description || '',
      presentation: school.presentation || '',
      dureeEtudes: school.dureeEtudes || '',
      diplome: school.diplome || '',
      admission: school.admission || '',
      siteWeb: school.siteWeb || '',
      contact: school.contact || '',
      telephone: school.telephone || '',
      adresse: school.adresse || '',
      note: school.note || ''
    });
    
    // Setup Logo preview if it exists
    setLogoFile(null);
    setRemoveLogo(false);
    if (school.logo) {
      if (school.logo.startsWith('http')) {
        setLogoPreview(school.logo);
      } else if (school.logo.startsWith('/storage/')) {
        setLogoPreview(`http://127.0.0.1:8000${school.logo}`);
      } else {
        setLogoPreview(school.logo); // Default React public folder
      }
    } else {
      setLogoPreview(null);
    }
    
    setError('');
    setShowModal(true);
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB restriction
        setError('L\'image ne doit pas dépasser 2 MB');
        return;
      }
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
      setRemoveLogo(false);
      setError('');
    }
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setRemoveLogo(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    if (!formData.nom.trim() || !formData.ville.trim() || !formData.type.trim()) {
      setError('Le nom, la ville et le type sont obligatoires');
      setSubmitting(false);
      return;
    }

    const formDataObj = new FormData();
    Object.keys(formData).forEach(key => {
      formDataObj.append(key, formData[key] === null ? '' : formData[key]);
    });
    
    // Explicitly parse note
    formDataObj.set('note', formData.note ? parseFloat(formData.note) : 0);

    if (logoFile) {
      formDataObj.append('logo', logoFile);
    } else if (removeLogo) {
      // Pass an empty string to trigger backend logo deletion (based on our controller logic)
      formDataObj.append('logo', '');
    }

    try {
      let response;
      if (editingSchool) {
        response = await adminUpdateSchool(editingSchool.id, formDataObj);
        if (response.data && response.data.success) {
          setSuccessMessage('École modifiée avec succès');
        } else {
          // Si l'API retourne du json normal sans "success" flag, on suppose que c'est bon
          setSuccessMessage('École modifiée avec succès');
        }
      } else {
        response = await adminCreateSchool(formDataObj);
        if (response.data && (response.data.success || response.data.id)) {
          setSuccessMessage('École créée avec succès');
        } else {
          setSuccessMessage('École créée avec succès'); // Fallback pour succès global
        }
      }
      
      setTimeout(() => setSuccessMessage(''), 3000);
      handleCloseModal();
      loadSchools();
    } catch (error) {
      console.error('Error saving school:', error);
      setError(error.message || error.response?.data?.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Chargement des écoles...</p>
      </div>
    );
  }

  return (
    <div className="admin-schools">
      {/* Header with Back Button */}
      <div className="admin-page-header">
        <button className="btn-back" onClick={() => navigate('/admin')}>
          <HiOutlineArrowLeft /> Retour au tableau de bord
        </button>
        <div className="admin-actions">
          <button className="btn-add" onClick={handleOpenCreate}>
            <HiOutlinePlus /> Nouvel établissement
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="alert-success">
          {successMessage}
        </div>
      )}

      {error && !deleteConfirm.show && (
        <div className="alert-error">
          {error}
        </div>
      )}

      <div className="section-card">
        <div className="section-header">
          <h2><HiOutlineBuildingLibrary /> Liste des établissements ({schools.length})</h2>
        </div>
        
        {schools.length === 0 ? (
          <div className="admin-empty">
            <div className="admin-empty-icon"><HiOutlineAcademicCap /></div>
            <p>Aucun établissement trouvé</p>
          </div>
        ) : (
          <>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Logo</th>
                    <th>Nom</th>
                    <th>Ville</th>
                    <th>Type</th>
                    <th>Note</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {schools.map((school) => (
                    <tr key={school.id}>
                      <td>{school.id}</td>
                      <td style={{ width: '60px', textAlign: 'center' }}>
                        {school.logo ? (
                          <img 
                            src={
                              school.logo.startsWith('http') 
                                ? school.logo 
                                : school.logo.startsWith('/storage/') 
                                  ? `http://127.0.0.1:8000${school.logo}` 
                                  : school.logo
                            } 
                            alt="logo" 
                            style={{ width: '40px', height: '40px', borderRadius: '10px', objectFit: 'cover', border: '1px solid rgba(0,255,255,0.1)', display: 'block', margin: '0 auto' }} 
                          />
                        ) : (
                          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px dashed rgba(255,255,255,0.2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                            <HiOutlineBuildingLibrary />
                          </div>
                        )}
                      </td>
                      <td><strong>{school.nom}</strong></td>
                      <td>{school.ville}</td>
                      <td>{school.type}</td>
                      <td>
                        <span className="rating-pill">
                          <HiOutlineStar className="star-icon" /> {school.note || 0}
                        </span>
                      </td>
                      <td className="actions-cell">
                        <button 
                          className="btn-edit" 
                          onClick={() => handleEdit(school)}
                          title="Modifier"
                        >
                          <HiOutlinePencil />
                        </button>
                        <button 
                          className="btn-delete" 
                          onClick={() => handleDeleteTrigger(school.id, school.nom)}
                          title="Supprimer"
                        >
                          <HiOutlineTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="page-btn"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  <HiOutlineChevronLeft />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    className={`page-btn ${currentPage === page ? 'active' : ''}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}
                <button
                  className="page-btn"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  <HiOutlineChevronRight />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal logic remains same */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-container">
              <h2>
                {editingSchool ? <HiOutlinePencil /> : <HiOutlinePlus />}
                <span>{editingSchool ? 'Modifier' : 'Ajouter'} un établissement</span>
              </h2>
              <button className="btn-close" onClick={handleCloseModal}>&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="premium-form">
              <div className="form-sections-grid">
                <div className="form-section">
                  <h3 className="form-section-title"><HiOutlinePhoto /> Identité Visuelle</h3>
                  <div className="logo-upload-container">
                    <div className="logo-preview-wrapper premium-border">
                      {logoPreview ? (
                        <div className="logo-preview-box">
                          <img src={logoPreview} alt="Aperçu logo" className="logo-img-preview" />
                          <button type="button" className="btn-remove-logo" onClick={handleRemoveLogo}>
                            <HiOutlineTrashIcon />
                          </button>
                        </div>
                      ) : (
                        <div className="logo-placeholder">
                          <HiOutlineBuildingLibrary className="placeholder-icon" />
                          <span>Aucun logo</span>
                        </div>
                      )}
                    </div>
                    <div className="logo-upload-actions">
                      <p className="upload-subtitle">Formats acceptés : JPG, PNG, WEBP (Max: 2MB)</p>
                      <label className="btn-upload">
                        <HiOutlinePhoto /> Parcourir...
                        <input type="file" accept="image/jpeg,image/png,image/webp,image/svg+xml" hidden onChange={handleLogoChange} />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3 className="form-section-title"><HiOutlineBuildingLibrary /> Informations Générales</h3>
                  <div className="form-fields-grid">
                    <div className="form-group">
                      <label>Nom de l'établissement *</label>
                      <div className="input-with-icon">
                        <HiOutlineBuildingLibrary className="input-icon" />
                        <input
                          type="text"
                          placeholder="Ex: École Supérieure..."
                          value={formData.nom}
                          onChange={(e) => setFormData({...formData, nom: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Ville *</label>
                      <div className="input-with-icon">
                        <HiOutlineMapPin className="input-icon" />
                        <input
                          type="text"
                          placeholder="Ex: Casablanca"
                          value={formData.ville}
                          onChange={(e) => setFormData({...formData, ville: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Type d'établissement *</label>
                      <div className="input-with-icon">
                        <HiOutlineTag className="input-icon" />
                        <input
                          type="text"
                          placeholder="Ex: Public, Privé..."
                          value={formData.type}
                          onChange={(e) => setFormData({...formData, type: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3 className="form-section-title"><HiOutlineGlobeAlt /> Coordonnées & Contact</h3>
                  <div className="form-fields-grid">
                    <div className="form-group">
                      <label>Site Web</label>
                      <div className="input-with-icon">
                        <HiOutlineGlobeAlt className="input-icon" />
                        <input
                          type="url"
                          placeholder="https://..."
                          value={formData.siteWeb}
                          onChange={(e) => setFormData({...formData, siteWeb: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Email de Contact</label>
                      <div className="input-with-icon">
                        <HiOutlineEnvelope className="input-icon" />
                        <input
                          type="email"
                          placeholder="contact@ecole.ma"
                          value={formData.contact}
                          onChange={(e) => setFormData({...formData, contact: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Téléphone</label>
                      <div className="input-with-icon">
                        <HiOutlinePhone className="input-icon" />
                        <input
                          type="text"
                          placeholder="+212 ..."
                          value={formData.telephone}
                          onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="form-group" style={{ gridColumn: 'span 3' }}>
                      <label>Adresse Physique</label>
                      <div className="input-with-icon">
                        <HiOutlineMapPin className="input-icon" />
                        <input
                          type="text"
                          placeholder="Rue, Quartier, Ville..."
                          value={formData.adresse}
                          onChange={(e) => setFormData({...formData, adresse: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3 className="form-section-title"><HiOutlineAcademicCap /> Détails Académiques</h3>
                  <div className="form-fields-grid">
                    <div className="form-group">
                      <label>Diplôme délivré</label>
                      <div className="input-with-icon">
                        <HiOutlineAcademicCap className="input-icon" />
                        <input
                          type="text"
                          placeholder="Ex: Ingénieur, Master..."
                          value={formData.diplome}
                          onChange={(e) => setFormData({...formData, diplome: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Durée des études</label>
                      <div className="input-with-icon">
                        <HiOutlineClock className="input-icon" />
                        <input
                          type="text"
                          placeholder="Ex: 5 ans"
                          value={formData.dureeEtudes}
                          onChange={(e) => setFormData({...formData, dureeEtudes: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Conditions d'admission</label>
                      <div className="input-with-icon">
                        <HiOutlineIdentification className="input-icon" />
                        <input
                          type="text"
                          placeholder="Ex: Concours, Dossier..."
                          value={formData.admission}
                          onChange={(e) => setFormData({...formData, admission: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Note de l'établissement (0-5)</label>
                      <div className="input-with-icon">
                        <HiOutlineStar className="input-icon" />
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="5"
                          placeholder="Ex: 4.5"
                          value={formData.note}
                          onChange={(e) => setFormData({...formData, note: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3 className="form-section-title"><HiOutlineDocumentText /> Présentation & Description</h3>
                  <div className="form-fields-grid full-width">
                    <div className="form-group">
                      <label>Brève Description</label>
                      <div className="input-with-icon">
                        <HiOutlineDocumentText className="input-icon" style={{ top: '20px' }} />
                        <textarea
                          placeholder="Résumé de l'établissement..."
                          value={formData.description}
                          onChange={(e) => setFormData({...formData, description: e.target.value})}
                          rows="3"
                          style={{ paddingLeft: '50px', paddingTop: '15px' }}
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Présentation Détaillée</label>
                      <div className="input-with-icon">
                        <HiOutlineDocumentText className="input-icon" style={{ top: '20px' }} />
                        <textarea
                          placeholder="Historique, missions, opportunités..."
                          value={formData.presentation}
                          onChange={(e) => setFormData({...formData, presentation: e.target.value})}
                          rows="5"
                          style={{ paddingLeft: '50px', paddingTop: '15px' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={handleCloseModal}>
                  Annuler
                </button>
                <button type="submit" disabled={submitting}>
                  {submitting ? 'Enregistrement...' : (editingSchool ? 'Sauvegarder les modifications' : 'Créer l\'établissement')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm({ show: false, id: null, name: '' })}>
          <div className="modal-content modal-confirm" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-icon-danger">
              <HiOutlineExclamationTriangle />
            </div>
            <h2 className="confirm-title">Suppression irréversible</h2>
            <p className="confirm-message">
              Êtes-vous sûr de vouloir supprimer l'établissement <br />
              <span className="confirm-item-name">{deleteConfirm.name}</span> ?
              <br /><br />
              Toutes les données associées seront définitivement effacées.
            </p>
            
            {error && (
              <div className="alert-error" style={{ margin: '0 0 20px 0' }}>
                {error}
              </div>
            )}

            <div className="modal-actions" style={{ justifyContent: 'center' }}>
              <button 
                type="button" 
                onClick={() => setDeleteConfirm({ show: false, id: null, name: '' })}
                disabled={submitting}
              >
                Annuler
              </button>
              <button 
                type="button" 
                className="btn-danger-large"
                onClick={handleConfirmDelete}
                disabled={submitting}
              >
                {submitting ? 'Suppression...' : 'Confirmer la suppression'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSchools;