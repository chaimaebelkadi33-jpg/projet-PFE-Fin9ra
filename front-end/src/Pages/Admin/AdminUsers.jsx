import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import { 
  adminGetUsers, 
  adminUpdateUser, 
  adminDeleteUser 
} from '../../Services/api';
import { 
  HiOutlineUserGroup, 
  HiOutlineArrowLeft, 
  HiOutlineTrash,
  HiOutlinePencil,
  HiOutlineShieldCheck,
  HiOutlineUser,
  HiOutlineMagnifyingGlass,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineExclamationTriangle,
  HiOutlineXMark,
  HiOutlineEnvelope
} from 'react-icons/hi2';
import '../../Styles/admin.css';
import '../../Styles/adminUsers.css';

const AdminUsers = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth(); // To prevent self-deletion
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Edit/Modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    is_admin: false
  });

  // Deletion state
  const [deleteConfirm, setDeleteConfirm] = useState({
    show: false,
    id: null,
    name: ''
  });

  useEffect(() => {
    loadUsers();
  }, [currentPage, searchTerm]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await adminGetUsers(currentPage, searchTerm);
      
      if (response.data) {
        setUsers(response.data.data || []);
        setTotalPages(response.data.last_page || 1);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      setError('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (user) => {
    setEditingUser(user);
    setEditFormData({
      name: user.name,
      email: user.email,
      is_admin: user.is_admin
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await adminUpdateUser(editingUser.id, editFormData);
      if (response.data && response.data.success) {
        setSuccessMessage('Utilisateur mis à jour avec succès');
        setShowEditModal(false);
        loadUsers();
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTrigger = (id, name) => {
    if (id === currentUser?.id) {
      setError("Vous ne pouvez pas supprimer votre propre compte.");
      setTimeout(() => setError(null), 3000);
      return;
    }
    setDeleteConfirm({ show: true, id, name });
  };

  const handleConfirmDelete = async () => {
    const { id } = deleteConfirm;
    try {
      setSubmitting(true);
      const response = await adminDeleteUser(id);
      if (response.data && response.data.success) {
        setSuccessMessage('Utilisateur supprimé avec succès');
        setDeleteConfirm({ show: false, id: null, name: '' });
        loadUsers();
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Erreur lors de la suppression');
      setTimeout(() => setError(null), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  const currentDate = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="admin-users">
      {/* Header with Back Button */}
      <div className="admin-page-header">
        <button className="btn-back" onClick={() => navigate('/admin')}>
          <HiOutlineArrowLeft /> Retour au tableau de bord
        </button>
      </div>

      {successMessage && (
        <div className="alert-success">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="alert-error">
          {error}
        </div>
      )}

      <div className="section-card">
        <div className="section-header-users">
          <div className="header-top-row">
            <h2 className="users-title">
              <span className="title-left">
                <HiOutlineUserGroup /> Gestion des Utilisateurs
              </span>
              <span className="current-date-dashboard">{currentDate}</span>
            </h2>
          </div>
          
          <div className="header-actions-row">
            <div className="search-bar-container">
              <div className="search-bar premium">
                <HiOutlineMagnifyingGlass className="search-icon" />
                <input 
                  type="text" 
                  placeholder="Rechercher par nom ou email..." 
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {loading && users.length === 0 ? (
          <div className="admin-loading">
            <div className="spinner"></div>
            <p>Chargement des utilisateurs...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="admin-empty">
            <div className="admin-empty-icon"><HiOutlineUser /></div>
            <p>Aucun utilisateur trouvé</p>
          </div>
        ) : (
          <>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Utilisateur</th>
                    <th>Email</th>
                    <th>Rôle</th>
                    <th>Date d'inscription</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className={u.id === currentUser?.id ? 'current-user-row' : ''}>
                      <td>
                        <div className="user-info-cell">
                          <strong>{u.name} {u.id === currentUser?.id && <span className="self-tag">(Vous)</span>}</strong>
                        </div>
                      </td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`role-badge ${u.is_admin ? 'admin' : 'user'}`}>
                          {u.is_admin ? <HiOutlineShieldCheck /> : <HiOutlineUser />}
                          {u.is_admin ? 'Administrateur' : 'Utilisateur'}
                        </span>
                      </td>
                      <td>
                        <span className="date-pill">
                          {new Date(u.created_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="actions-cell">
                        <button 
                          className="btn-edit" 
                          onClick={() => handleEditClick(u)}
                          title="Modifier l'utilisateur"
                        >
                          <HiOutlinePencil />
                        </button>
                        <button 
                          className="btn-delete" 
                          onClick={() => handleDeleteTrigger(u.id, u.name)}
                          disabled={submitting || u.id === currentUser?.id}
                          title="Supprimer l'utilisateur"
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

      {/* Edit User Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-container">
              <h2>
                <HiOutlinePencil />
                <span>Modifier l'utilisateur</span>
              </h2>
              <button className="btn-close" onClick={() => setShowEditModal(false)}>
                <HiOutlineXMark />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="premium-form">
              <div className="form-group">
                <label>Nom complet</label>
                <div className="input-with-icon">
                  <HiOutlineUser className="input-icon" />
                  <input
                    type="text"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Adresse Email</label>
                <div className="input-with-icon">
                  <HiOutlineEnvelope className="input-icon" />
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Rôle de l'utilisateur</label>
                <div className="role-toggle-container">
                  <div className={`role-option ${!editFormData.is_admin ? 'active' : ''}`} onClick={() => setEditFormData({...editFormData, is_admin: false})}>
                    <HiOutlineUser />
                    <span>Utilisateur</span>
                  </div>
                  <div className={`role-option admin ${editFormData.is_admin ? 'active' : ''}`} onClick={() => setEditFormData({...editFormData, is_admin: true})}>
                    <HiOutlineShieldCheck />
                    <span>Administrateur</span>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowEditModal(false)}>
                  Annuler
                </button>
                <button type="submit" disabled={submitting}>
                  {submitting ? 'Mise à jour...' : 'Sauvegarder'}
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
            <h2 className="confirm-title">Suppression d'utilisateur</h2>
            <p className="confirm-message">
              Êtes-vous sûr de vouloir supprimer l'utilisateur <br />
              <span className="confirm-item-name">{deleteConfirm.name}</span> ?
              <br /><br />
              Cette action supprimera également tous les avis associés.
            </p>

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
                {submitting ? 'Suppression...' : 'Supprimer définitivement'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminUsers;
