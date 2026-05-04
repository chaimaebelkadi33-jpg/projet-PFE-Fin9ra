import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  adminGetFormations,
  adminCreateFormation,
  adminUpdateFormation,
  adminDeleteFormation,
  adminGetSchool,
} from "../../Services/api";
import {
  HiOutlineAcademicCap,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlinePlus,
  HiOutlineArrowLeft,
  HiOutlineTag,
  HiOutlineDocumentText,
  HiOutlineClock,
  HiOutlineIdentification,
  HiOutlineExclamationTriangle,
} from "react-icons/hi2";
import "../../Styles/admin.css";

const AdminFormations = () => {
  const { schoolId } = useParams();
  const navigate = useNavigate();
  const [formations, setFormations] = useState([]);
  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFormation, setEditingFormation] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [deleteConfirm, setDeleteConfirm] = useState({
    show: false,
    id: null,
    name: "",
  });

  const [formData, setFormData] = useState({
    nom: "",
    type: "",
    specialites: "",
    description: "",
    duree_mois: "",
    niveau_acces: "",
    est_alternance: false,
    est_international: false,
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [schoolRes, formationsRes] = await Promise.all([
        adminGetSchool(schoolId),
        adminGetFormations(schoolId),
      ]);
      
      setSchool(schoolRes.data.data || schoolRes.data);
      setFormations(formationsRes.data);
    } catch (error) {
      console.error("Error loading formations:", error);
      setError("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  }, [schoolId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const resetForm = () => {
    setFormData({
      nom: "",
      type: "",
      specialites: "",
      description: "",
      duree_mois: "",
      niveau_acces: "",
      est_alternance: false,
      est_international: false,
    });
    setEditingFormation(null);
    setError("");
  };

  const handleOpenCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEdit = (formation) => {
    setEditingFormation(formation);
    
    let specs = "";
    if (formation.specialites) {
      if (Array.isArray(formation.specialites)) {
        specs = formation.specialites.join(", ");
      } else if (typeof formation.specialites === 'string') {
        try {
          const parsed = JSON.parse(formation.specialites);
          specs = Array.isArray(parsed) ? parsed.join(", ") : formation.specialites;
        } catch (e) {
          specs = formation.specialites;
        }
      }
    }

    setFormData({
      nom: formation.nom || "",
      type: formation.type || "",
      specialites: specs,
      description: formation.description || "",
      duree_mois: formation.duree_mois || "",
      niveau_acces: formation.niveau_acces || "",
      est_alternance: !!formation.est_alternance,
      est_international: !!formation.est_international,
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleDeleteTrigger = (id, nom) => {
    setDeleteConfirm({
      show: true,
      id,
      name: nom,
    });
  };

  const handleConfirmDelete = async () => {
    setSubmitting(true);
    try {
      await adminDeleteFormation(deleteConfirm.id);
      setSuccessMessage("Formation supprimée avec succès");
      setTimeout(() => setSuccessMessage(""), 3000);
      setDeleteConfirm({ show: false, id: null, name: "" });
      loadData();
    } catch (error) {
      setError("Erreur lors de la suppression");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const specialitesArray = formData.specialites
      ? formData.specialites.split(",").map((s) => s.trim()).filter((s) => s !== "")
      : [];

    const data = {
      ...formData,
      specialites: specialitesArray,
    };

    try {
      if (editingFormation) {
        await adminUpdateFormation(editingFormation.id, data);
        setSuccessMessage("Formation mise à jour avec succès");
      } else {
        await adminCreateFormation(schoolId, data);
        setSuccessMessage("Formation créée avec succès");
      }
      
      setTimeout(() => setSuccessMessage(""), 3000);
      handleCloseModal();
      loadData();
    } catch (error) {
      console.error("Error saving formation:", error);
      setError(error.response?.data?.message || "Erreur lors de l'enregistrement");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !school) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Chargement des formations...</p>
      </div>
    );
  }

  const currentDate = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="admin-schools">
      <div className="admin-page-header">
        <button className="btn-back" onClick={() => navigate("/admin/schools")}>
          <HiOutlineArrowLeft /> Retour aux établissements
        </button>
        <div className="admin-actions">
          <button className="btn-add" onClick={handleOpenCreate}>
            <HiOutlinePlus /> Nouvelle formation
          </button>
        </div>
      </div>

      {successMessage && <div className="alert-success">{successMessage}</div>}
      {error && !deleteConfirm.show && <div className="alert-error">{error}</div>}

      <div className="section-card">
        <div className="section-header">
          <h2>
            <span className="title-left">
              <HiOutlineAcademicCap /> Formations de : {school?.nom} ({formations.length})
            </span>
            <span className="current-date-dashboard">{currentDate}</span>
          </h2>
        </div>

        {formations.length === 0 ? (
          <div className="admin-empty">
            <div className="admin-empty-icon">
              <HiOutlineAcademicCap />
            </div>
            <p>Aucune formation trouvée pour cet établissement</p>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nom</th>
                  <th>Type</th>
                  <th>Niveau</th>
                  <th>Durée</th>
                  <th>Alternance</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {formations.map((f) => (
                  <tr key={f.id}>
                    <td>{f.id}</td>
                    <td><strong>{f.nom}</strong></td>
                    <td>{f.type}</td>
                    <td>{f.niveau_acces}</td>
                    <td>{f.duree_mois} mois</td>
                    <td>
                      {f.est_alternance ? (
                        <span className="rating-pill" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>Oui</span>
                      ) : (
                        <span className="rating-pill" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', color: '#94a3b8' }}>Non</span>
                      )}
                    </td>
                    <td className="actions-cell">
                      <button className="btn-edit" onClick={() => handleEdit(f)} title="Modifier">
                        <HiOutlinePencil />
                      </button>
                      <button className="btn-delete" onClick={() => handleDeleteTrigger(f.id, f.nom)} title="Supprimer">
                        <HiOutlineTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-container">
              <h2>
                {editingFormation ? <HiOutlinePencil /> : <HiOutlinePlus />}
                <span>{editingFormation ? "Modifier" : "Ajouter"} une formation</span>
              </h2>
              <button className="btn-close" onClick={handleCloseModal}>&times;</button>
            </div>

            <form onSubmit={handleSubmit} className="premium-form">
              <div className="form-sections-grid">
                <div className="form-section">
                  <h3 className="form-section-title"><HiOutlineAcademicCap /> Détails Principaux</h3>
                  <div className="form-fields-grid">
                    <div className="form-group">
                      <label>Nom de la formation *</label>
                      <div className="input-with-icon">
                        <HiOutlineAcademicCap className="input-icon" />
                        <input
                          type="text"
                          placeholder="Ex: Ingénierie Informatique"
                          value={formData.nom}
                          onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Type de formation</label>
                      <div className="input-with-icon">
                        <HiOutlineTag className="input-icon" />
                        <input
                          type="text"
                          placeholder="Ex: Master, Ingénieur, Licence..."
                          value={formData.type}
                          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Niveau d'accès</label>
                      <div className="input-with-icon">
                        <HiOutlineIdentification className="input-icon" />
                        <input
                          type="text"
                          placeholder="Ex: Bac, Bac+2..."
                          value={formData.niveau_acces}
                          onChange={(e) => setFormData({ ...formData, niveau_acces: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Durée (mois)</label>
                      <div className="input-with-icon">
                        <HiOutlineClock className="input-icon" />
                        <input
                          type="number"
                          placeholder="Ex: 36"
                          value={formData.duree_mois}
                          onChange={(e) => setFormData({ ...formData, duree_mois: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3 className="form-section-title"><HiOutlineTag /> Spécialités & Description</h3>
                  <div className="form-fields-grid full-width">
                    <div className="form-group">
                      <label>Spécialités (séparées par des virgules)</label>
                      <div className="input-with-icon">
                        <HiOutlineTag className="input-icon" />
                        <input
                          type="text"
                          placeholder="Ex: Développement, Réseaux, IA..."
                          value={formData.specialites}
                          onChange={(e) => setFormData({ ...formData, specialites: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Description</label>
                      <div className="input-with-icon">
                        <HiOutlineDocumentText className="input-icon" style={{ top: '20px' }} />
                        <textarea
                          placeholder="Détails sur la formation..."
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          rows="4"
                          style={{ paddingLeft: '50px', paddingTop: '15px' }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-fields-grid" style={{ marginTop: '20px' }}>
                    <label className="checkbox-container">
                      <input
                        type="checkbox"
                        checked={formData.est_alternance}
                        onChange={(e) => setFormData({ ...formData, est_alternance: e.target.checked })}
                      />
                      <span>Disponible en alternance</span>
                    </label>
                    <label className="checkbox-container">
                      <input
                        type="checkbox"
                        checked={formData.est_international}
                        onChange={(e) => setFormData({ ...formData, est_international: e.target.checked })}
                      />
                      <span>Cursus international</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={handleCloseModal}>Annuler</button>
                <button type="submit" disabled={submitting}>
                  {submitting ? "Enregistrement..." : (editingFormation ? "Mettre à jour" : "Créer la formation")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirm.show && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm({ show: false, id: null, name: "" })}>
          <div className="modal-content modal-confirm" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-icon-danger">
              <HiOutlineExclamationTriangle />
            </div>
            <h2 className="confirm-title">Supprimer la formation ?</h2>
            <p className="confirm-message">
              Êtes-vous sûr de vouloir supprimer <span className="confirm-item-name">{deleteConfirm.name}</span> ?
            </p>
            <div className="modal-actions" style={{ justifyContent: "center" }}>
              <button type="button" onClick={() => setDeleteConfirm({ show: false, id: null, name: "" })}>Annuler</button>
              <button type="button" className="btn-danger-large" onClick={handleConfirmDelete} disabled={submitting}>
                {submitting ? "Suppression..." : "Confirmer la suppression"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFormations;
