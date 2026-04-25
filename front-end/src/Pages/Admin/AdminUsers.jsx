import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import { 
  adminGetUsers, 
  adminToggleUserRole, 
  adminDeleteUser 
} from '../../Services/api';
import { 
  HiOutlineUserGroup, 
  HiOutlineArrowLeft, 
  HiOutlineTrash,
  HiOutlineShieldCheck,
  HiOutlineUser,
  HiOutlineMagnifyingGlass,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineExclamationTriangle,
  HiOutlineIdentification
} from 'react-icons/hi2';
import '../../Styles/admin.css';

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

  const handleToggleRole = async (userId) => {
    if (userId === currentUser?.id) {
      setError("Vous ne pouvez pas modifier votre propre rôle.");
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      setSubmitting(true);
      const response = await adminToggleUserRole(userId);
      if (response.data && response.data.success) {
        setSuccessMessage(response.data.message);
        setTimeout(() => setSuccessMessage(''), 3000);
        loadUsers();
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Erreur lors du changement de rôle');
      setTimeout(() => setError(null), 3000);
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
        <div className="section-header">
          <h2><HiOutlineUserGroup /> Gestion des Utilisateurs</h2>
          
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
                          <div className={`user-avatar-mini ${u.is_admin ? 'admin' : ''}`}>
                            {u.name.charAt(0).toUpperCase()}
                          </div>
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
                          className={`btn-role-toggle ${u.is_admin ? 'demote' : 'promote'}`}
                          onClick={() => handleToggleRole(u.id)}
                          disabled={submitting || u.id === currentUser?.id}
                          title={u.is_admin ? "Rétrograder en utilisateur" : "Promouvoir en administrateur"}
                        >
                          <HiOutlineIdentification />
                          {u.is_admin ? 'Rétrograder' : 'Promouvoir'}
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
              Cette action supprimera également tous les avis et données associés à ce compte.
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

      <style jsx>{`
        .search-bar.premium {
          position: relative;
          display: flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 50px;
          padding: 0 20px;
          width: 350px;
          transition: all 0.3s ease;
        }

        .search-bar.premium:focus-within {
          border-color: #00ffff;
          background: rgba(0, 255, 255, 0.05);
          box-shadow: 0 0 15px rgba(0, 255, 255, 0.1);
        }

        .search-icon {
          color: #94a3b8;
          font-size: 1.2rem;
        }

        .search-bar.premium input {
          background: transparent;
          border: none;
          color: white;
          padding: 12px 15px;
          width: 100%;
          outline: none;
        }

        .user-info-cell {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .user-avatar-mini {
          width: 40px;
          height: 40px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          color: #94a3b8;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .user-avatar-mini.admin {
          background: rgba(0, 255, 255, 0.1);
          color: #00ffff;
          border-color: rgba(0, 255, 255, 0.2);
        }

        .self-tag {
          color: #00ffff;
          font-size: 0.8rem;
          margin-left: 5px;
          opacity: 0.8;
        }

        .current-user-row td {
          background: rgba(0, 255, 255, 0.02) !important;
        }

        .role-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          border-radius: 50px;
          font-size: 0.85rem;
          font-weight: 700;
        }

        .role-badge.admin {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
          border: 1px solid rgba(16, 185, 129, 0.2);
        }

        .role-badge.user {
          background: rgba(148, 163, 184, 0.1);
          color: #94a3b8;
          border: 1px solid rgba(148, 163, 184, 0.2);
        }

        .btn-role-toggle {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 12px;
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 1px solid transparent;
        }

        .btn-role-toggle.promote {
          background: rgba(0, 255, 255, 0.1);
          color: #00ffff;
          border-color: rgba(0, 255, 255, 0.2);
        }

        .btn-role-toggle.promote:hover {
          background: #00ffff;
          color: #002147;
          transform: translateY(-2px);
        }

        .btn-role-toggle.demote {
          background: rgba(245, 158, 11, 0.1);
          color: #f59e0b;
          border-color: rgba(245, 158, 11, 0.2);
        }

        .btn-role-toggle.demote:hover {
          background: #f59e0b;
          color: #002147;
          transform: translateY(-2px);
        }

        .btn-role-toggle:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none !important;
        }

        @media (max-width: 900px) {
          .section-header {
            flex-direction: column;
            align-items: stretch;
            gap: 20px;
          }
          .search-bar.premium {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminUsers;
