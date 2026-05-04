import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  adminGetSchools,
  adminDeleteSchool,
  adminCreateSchool,
  adminUpdateSchool,
  getImageUrl,
} from "../../Services/api";
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
  HiOutlineQueueList,
} from "react-icons/hi2";
import "../../Styles/admin.css";

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
    name: "",
  });

  // Logo specifically
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [removeLogo, setRemoveLogo] = useState(false);
  const [imagesFiles, setImagesFiles] = useState([]);
  const [imagesPreviews, setImagesPreviews] = useState([]);
  const [removeImages, setRemoveImages] = useState(false);

  const [formData, setFormData] = useState({
    nom: "",
    ville: "",
    type: "",
    description: "",
    presentation: "",
    dureeEtudes: "",
    diplome: "",
    admission: "",
    siteWeb: "",
    contact: "",
    telephone: "",
    adresse: "",
    note: "",
    short_name: "",
    domaine_principal: "",
    categorie_ecole: "",
    mots_cles_recherche: "",
    prerequis_bac_type: "",
    prerequis_bac_mention: "",
    a_internat: false,
    cout_public: "",
    cout_prive: "",
    admission_concours_note_min: "",
    admission_prive_possible: false,
    admission_concours_possible: true,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

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
      console.error("Error loading schools:", error);
      setError("Erreur lors du chargement des écoles");
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTrigger = (id, nom) => {
    setDeleteConfirm({
      show: true,
      id,
      name: nom,
    });
  };

  const handleConfirmDelete = async () => {
    const { id, name } = deleteConfirm;
    setSubmitting(true);
    setError("");

    try {
      const response = await adminDeleteSchool(id);
      if (response.data && response.data.success) {
        setSuccessMessage(`"${name}" a été supprimé avec succès`);
        setTimeout(() => setSuccessMessage(""), 3000);
        setDeleteConfirm({ show: false, id: null, name: "" });
        loadSchools();
      } else {
        setError(response.data?.message || "Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Error deleting school:", error);
      setError(
        error.response?.data?.message || "Erreur lors de la suppression",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nom: "",
      ville: "",
      type: "",
      description: "",
      presentation: "",
      dureeEtudes: "",
      diplome: "",
      admission: "",
      siteWeb: "",
      contact: "",
      telephone: "",
      adresse: "",
      note: "",
      short_name: "",
      domaine_principal: "",
      categorie_ecole: "",
      mots_cles_recherche: "",
      prerequis_bac_type: "",
      prerequis_bac_mention: "",
      a_internat: false,
      cout_public: "",
      cout_prive: "",
      admission_concours_note_min: "",
      admission_prive_possible: false,
      admission_concours_possible: true,
    });
    setEditingSchool(null);
    setLogoFile(null);
    setLogoPreview(null);
    setRemoveLogo(false);
    setImagesFiles([]);
    setImagesPreviews([]);
    setRemoveImages(false);
    setError("");
  };

  const handleOpenCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEdit = (school) => {
    setEditingSchool(school);
    setFormData({
      nom: school.nom || "",
      ville: school.ville || "",
      type: school.type || "",
      description: school.description || "",
      presentation: school.presentation || "",
      dureeEtudes: school.dureeEtudes || "",
      diplome: school.diplome || "",
      admission: school.admission || "",
      siteWeb: school.siteWeb || "",
      contact: school.contact || "",
      telephone: school.telephone || "",
      adresse: school.adresse || "",
      note: school.note || "",
      short_name: school.short_name || "",
      domaine_principal: school.domaine_principal || "",
      categorie_ecole: school.categorie_ecole || "",
      mots_cles_recherche: Array.isArray(school.mots_cles_recherche)
        ? school.mots_cles_recherche.join(", ")
        : school.mots_cles_recherche || "",
      prerequis_bac_type: Array.isArray(school.prerequis_bac_type)
        ? school.prerequis_bac_type.join(", ")
        : school.prerequis_bac_type || "",
      prerequis_bac_mention: school.prerequis_bac_mention || "",
      a_internat: !!school.a_internat,
      cout_public: school.cout_public || "",
      cout_prive: school.cout_prive || "",
      admission_concours_note_min: school.admission_concours_note_min || "",
      admission_prive_possible: !!school.admission_prive_possible,
      admission_concours_possible: school.admission_concours_possible !== false,
    });

    // Setup Logo preview if it exists
    setLogoFile(null);
    setRemoveLogo(false);
    if (school.logo) {
      setLogoPreview(getImageUrl(school.logo));
    } else {
      setLogoPreview(null);
    }

    // Setup Gallery images previews
    setImagesFiles([]);
    setRemoveImages(false);
    if (school.images && Array.isArray(school.images)) {
      setImagesPreviews(school.images.map((img) => getImageUrl(img)));
    } else {
      setImagesPreviews([]);
    }

    setError("");
    setShowModal(true);
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        // 2MB restriction
        setError("L'image ne doit pas dépasser 2 MB");
        return;
      }
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
      setRemoveLogo(false);
      setError("");
    }
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setRemoveLogo(true);
  };

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      if (files.length > 5) {
        setError("Maximum 5 images autorisées");
        return;
      }

      const tooLarge = files.some((file) => file.size > 2 * 1024 * 1024);
      if (tooLarge) {
        setError("Une ou plusieurs images dépassent 2 MB");
        return;
      }

      setImagesFiles(files);
      setImagesPreviews(files.map((file) => URL.createObjectURL(file)));
      setRemoveImages(false);
      setError("");
    }
  };

  const handleClearImages = () => {
    setImagesFiles([]);
    setImagesPreviews([]);
    setRemoveImages(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    if (
      !formData.nom.trim() ||
      !formData.ville.trim() ||
      !formData.type.trim()
    ) {
      setError("Le nom, la ville et le type sont obligatoires");
      setSubmitting(false);
      return;
    }

    const formDataObj = new FormData();
    Object.keys(formData).forEach((key) => {
      let value = formData[key];

      // Handle specific types
      if (key === "mots_cles_recherche" || key === "prerequis_bac_type") {
        const arrayValue = value
          ? value
              .split(",")
              .map((item) => item.trim())
              .filter((item) => item !== "")
          : [];
        value = JSON.stringify(arrayValue);
      } else if (
        key === "a_internat" ||
        key === "admission_prive_possible" ||
        key === "admission_concours_possible"
      ) {
        value = value ? "1" : "0";
      } else if (value === null) {
        value = "";
      }

      formDataObj.append(key, value);
    });

    // Explicitly parse note
    formDataObj.set("note", formData.note ? parseFloat(formData.note) : 0);

    if (logoFile) {
      formDataObj.append("logo", logoFile);
    } else if (removeLogo) {
      formDataObj.append("remove_logo", "1");
    }

    if (imagesFiles.length > 0) {
      imagesFiles.forEach((file) => {
        formDataObj.append("images[]", file);
      });
    } else if (removeImages) {
      formDataObj.append("remove_images", "1");
    }

    try {
      let response;
      if (editingSchool) {
        response = await adminUpdateSchool(editingSchool.id, formDataObj);
        if (response.data && response.data.success) {
          setSuccessMessage("École modifiée avec succès");
        } else {
          // Si l'API retourne du json normal sans "success" flag, on suppose que c'est bon
          setSuccessMessage("École modifiée avec succès");
        }
      } else {
        response = await adminCreateSchool(formDataObj);
        if (response.data && (response.data.success || response.data.id)) {
          setSuccessMessage("École créée avec succès");
        } else {
          setSuccessMessage("École créée avec succès"); // Fallback pour succès global
        }
      }

      setTimeout(() => setSuccessMessage(""), 3000);
      handleCloseModal();
      loadSchools();
    } catch (error) {
      console.error("Error saving school:", error);
      setError(
        error.message ||
          error.response?.data?.message ||
          "Erreur lors de l'enregistrement",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const currentDate = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

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
        <button className="btn-back" onClick={() => navigate("/admin")}>
          <HiOutlineArrowLeft /> Retour au tableau de bord
        </button>
        <div className="admin-actions">
          <button className="btn-add" onClick={handleOpenCreate}>
            <HiOutlinePlus /> Nouvel établissement
          </button>
        </div>
      </div>

      {successMessage && <div className="alert-success">{successMessage}</div>}

      {error && !deleteConfirm.show && (
        <div className="alert-error">{error}</div>
      )}

      <div className="section-card">
        <div className="section-header">
          <h2>
            <span className="title-left">
              <HiOutlineBuildingLibrary /> Liste des établissements (
              {schools.length})
            </span>
            <span className="current-date-dashboard">{currentDate}</span>
          </h2>
        </div>

        {schools.length === 0 ? (
          <div className="admin-empty">
            <div className="admin-empty-icon">
              <HiOutlineAcademicCap />
            </div>
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
                      <td style={{ width: "60px", textAlign: "center" }}>
                        {school.logo ? (
                          <img
                            src={getImageUrl(school.logo)}
                            alt="logo"
                            style={{
                              width: "40px",
                              height: "40px",
                              borderRadius: "10px",
                              objectFit: "cover",
                              border: "1px solid rgba(0,255,255,0.1)",
                              display: "block",
                              margin: "0 auto",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: "40px",
                              height: "40px",
                              borderRadius: "10px",
                              background: "rgba(255,255,255,0.05)",
                              border: "1px dashed rgba(255,255,255,0.2)",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#64748b",
                            }}
                          >
                            <HiOutlineBuildingLibrary />
                          </div>
                        )}
                      </td>
                      <td>
                        <strong>{school.nom}</strong>
                      </td>
                      <td>{school.ville}</td>
                      <td>{school.type}</td>
                      <td>
                        <span className="rating-pill">{school.note || 0}</span>
                      </td>
                      <td className="actions-cell">
                        <button
                          className="btn-edit"
                          onClick={() => navigate(`/admin/schools/${school.id}/formations`)}
                          title="Gérer les formations"
                          style={{ backgroundColor: "rgba(0, 255, 255, 0.1)", color: "#00ffff" }}
                        >
                          <HiOutlineQueueList />
                        </button>
                        <button
                          className="btn-edit"
                          onClick={() => handleEdit(school)}
                          title="Modifier"
                        >
                          <HiOutlinePencil />
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() =>
                            handleDeleteTrigger(school.id, school.nom)
                          }
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
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      className={`page-btn ${currentPage === page ? "active" : ""}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  ),
                )}
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
                <span>
                  {editingSchool ? "Modifier" : "Ajouter"} un établissement
                </span>
              </h2>
              <button className="btn-close" onClick={handleCloseModal}>
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="premium-form">
              <div className="form-sections-grid">
                <div className="form-section">
                  <h3 className="form-section-title">
                    <HiOutlinePhoto /> Identité Visuelle
                  </h3>
                  <div className="logo-upload-container">
                    <div className="logo-preview-wrapper premium-border">
                      {logoPreview ? (
                        <div className="logo-preview-box">
                          <img
                            src={logoPreview}
                            alt="Aperçu logo"
                            className="logo-img-preview"
                          />
                          <button
                            type="button"
                            className="btn-remove-logo"
                            onClick={handleRemoveLogo}
                          >
                            <HiOutlineTrash />
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
                      <p className="upload-subtitle">
                        Formats acceptés : JPG, PNG, WEBP (Max: 2MB)
                      </p>
                      <label className="btn-upload">
                        <HiOutlinePhoto /> Parcourir...
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/svg+xml"
                          hidden
                          onChange={handleLogoChange}
                        />
                      </label>
                    </div>
                  </div>

                  <h3
                    className="form-section-title"
                    style={{ marginTop: "20px" }}
                  >
                    <HiOutlinePhoto /> Galerie Photos
                  </h3>
                  <div className="gallery-upload-container">
                    <div className="images-preview-grid">
                      {imagesPreviews.length > 0 ? (
                        imagesPreviews.map((preview, idx) => (
                          <div
                            key={idx}
                            className="gallery-preview-item premium-border"
                          >
                            <img src={preview} alt={`Galerie ${idx}`} />
                          </div>
                        ))
                      ) : (
                        <div className="gallery-placeholder">
                          <HiOutlinePhoto className="placeholder-icon" />
                          <span>Aucune image</span>
                        </div>
                      )}
                    </div>
                    <div className="gallery-upload-actions">
                      <p className="upload-subtitle">
                        Jusqu'à 5 images (JPG, PNG, WEBP)
                      </p>
                      <div className="gallery-buttons">
                        <label className="btn-upload">
                          <HiOutlinePlus /> Sélectionner...
                          <input
                            type="file"
                            multiple
                            accept="image/jpeg,image/png,image/webp"
                            hidden
                            onChange={handleImagesChange}
                          />
                        </label>
                        {imagesPreviews.length > 0 && (
                          <button
                            type="button"
                            className="btn-delete-small"
                            onClick={handleClearImages}
                          >
                            Effacer la galerie
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3 className="form-section-title">
                    <HiOutlineBuildingLibrary /> Informations Générales
                  </h3>
                  <div className="form-fields-grid">
                    <div className="form-group">
                      <label>Nom de l'établissement *</label>
                      <div className="input-with-icon">
                        <HiOutlineBuildingLibrary className="input-icon" />
                        <input
                          type="text"
                          placeholder="Ex: École Supérieure..."
                          value={formData.nom}
                          onChange={(e) =>
                            setFormData({ ...formData, nom: e.target.value })
                          }
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
                          onChange={(e) =>
                            setFormData({ ...formData, ville: e.target.value })
                          }
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
                          onChange={(e) =>
                            setFormData({ ...formData, type: e.target.value })
                          }
                          required
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Acronyme (ex: ENSIAS)</label>
                      <div className="input-with-icon">
                        <HiOutlineBuildingLibrary className="input-icon" />
                        <input
                          type="text"
                          placeholder="Ex: EMI, ENCG..."
                          value={formData.short_name}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              short_name: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3 className="form-section-title">
                    <HiOutlineTag /> Catégorisation
                  </h3>
                  <div className="form-fields-grid">
                    <div className="form-group">
                      <label>Domaine Principal</label>
                      <div className="input-with-icon">
                        <HiOutlineTag className="input-icon" />
                        <select
                          value={formData.domaine_principal}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              domaine_principal: e.target.value,
                            })
                          }
                          style={{ paddingLeft: "50px" }}
                        >
                          <option value="">Sélectionner un domaine</option>
                          <option value="Informatique">Informatique</option>
                          <option value="Commerce">Commerce</option>
                          <option value="Santé">Santé</option>
                          <option value="Ingénierie">Ingénierie</option>
                          <option value="Sciences">Sciences</option>
                          <option value="Droit">Droit</option>
                          <option value="Lettres">Lettres</option>
                          <option value="Communication">Communication</option>
                          <option value="Architecture">Architecture</option>
                          <option value="Agriculture">Agriculture</option>
                          <option value="Télécommunications">
                            Télécommunications
                          </option>
                          <option value="Multidisciplinaire">
                            Multidisciplinaire
                          </option>
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Catégorie d'école</label>
                      <div className="input-with-icon">
                        <HiOutlineBuildingLibrary className="input-icon" />
                        <select
                          value={formData.categorie_ecole}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              categorie_ecole: e.target.value,
                            })
                          }
                          style={{ paddingLeft: "50px" }}
                        >
                          <option value="">Sélectionner une catégorie</option>
                          <option value="grande_ecole_ingenieur">
                            Grande École d'Ingénieur
                          </option>
                          <option value="ecole_ingenieur_publique">
                            École d'Ingénieur Publique
                          </option>
                          <option value="ecole_ingenieur_privee">
                            École d'Ingénieur Privée
                          </option>
                          <option value="faculte_sciences">
                            Faculté des Sciences
                          </option>
                          <option value="faculte_droit_economie">
                            Faculté de Droit & Économie
                          </option>
                          <option value="faculte_lettres">
                            Faculté des Lettres
                          </option>
                          <option value="ecole_commerce_gestion">
                            École de Commerce & Gestion
                          </option>
                          <option value="ecole_architecture">
                            École d'Architecture
                          </option>
                          <option value="ecole_sciences_appliquees">
                            École des Sciences Appliquées
                          </option>
                          <option value="centre_formation">
                            Centre de Formation
                          </option>
                          <option value="universite_publique">
                            Université Publique
                          </option>
                          <option value="autre">Autre</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3 className="form-section-title">
                    <HiOutlineGlobeAlt /> Coordonnées & Contact
                  </h3>
                  <div className="form-fields-grid">
                    <div className="form-group">
                      <label>Site Web</label>
                      <div className="input-with-icon">
                        <HiOutlineGlobeAlt className="input-icon" />
                        <input
                          type="url"
                          placeholder="https://..."
                          value={formData.siteWeb}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              siteWeb: e.target.value,
                            })
                          }
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
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              contact: e.target.value,
                            })
                          }
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
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              telephone: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div
                      className="form-group"
                      style={{ gridColumn: "span 3" }}
                    >
                      <label>Adresse Physique</label>
                      <div className="input-with-icon">
                        <HiOutlineMapPin className="input-icon" />
                        <input
                          type="text"
                          placeholder="Rue, Quartier, Ville..."
                          value={formData.adresse}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              adresse: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3 className="form-section-title">
                    <HiOutlineAcademicCap /> Détails Académiques
                  </h3>
                  <div className="form-fields-grid">
                    <div className="form-group">
                      <label>Diplôme délivré</label>
                      <div className="input-with-icon">
                        <HiOutlineAcademicCap className="input-icon" />
                        <input
                          type="text"
                          placeholder="Ex: Ingénieur, Master..."
                          value={formData.diplome}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              diplome: e.target.value,
                            })
                          }
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
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              dureeEtudes: e.target.value,
                            })
                          }
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
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              admission: e.target.value,
                            })
                          }
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
                          onChange={(e) =>
                            setFormData({ ...formData, note: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3 className="form-section-title">
                    <HiOutlineIdentification /> Admission & Coûts
                  </h3>
                  <div className="form-fields-grid">
                    <div className="form-group">
                      <label>Frais Concours / Public (MAD/an)</label>
                      <div className="input-with-icon">
                        <HiOutlineTag className="input-icon" />
                        <input
                          type="number"
                          placeholder="Ex: 500"
                          value={formData.cout_public}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              cout_public: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Frais Voie Privée (MAD/an)</label>
                      <div className="input-with-icon">
                        <HiOutlineTag className="input-icon" />
                        <input
                          type="number"
                          placeholder="Ex: 45000"
                          value={formData.cout_prive}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              cout_prive: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Note Min Bac (Concours)</label>
                      <div className="input-with-icon">
                        <HiOutlineStar className="input-icon" />
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Ex: 14.5"
                          value={formData.admission_concours_note_min}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              admission_concours_note_min: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Mention Bac Requise</label>
                      <div className="input-with-icon">
                        <HiOutlineIdentification className="input-icon" />
                        <select
                          value={formData.prerequis_bac_mention}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              prerequis_bac_mention: e.target.value,
                            })
                          }
                          style={{ paddingLeft: "50px" }}
                        >
                          <option value="">Aucune</option>
                          <option value="Passable">Passable</option>
                          <option value="Assez bien">Assez bien</option>
                          <option value="Bien">Bien</option>
                          <option value="Très bien">Très bien</option>
                        </select>
                      </div>
                    </div>
                    <div
                      className="form-group"
                      style={{ gridColumn: "span 3", display: "flex", gap: "20px" }}
                    >
                      <label className="checkbox-container">
                        <input
                          type="checkbox"
                          checked={formData.a_internat}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              a_internat: e.target.checked,
                            })
                          }
                        />
                        <span>Dispose d'un internat</span>
                      </label>
                      <label className="checkbox-container">
                        <input
                          type="checkbox"
                          checked={formData.admission_prive_possible}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              admission_prive_possible: e.target.checked,
                            })
                          }
                        />
                        <span>Admission privée possible</span>
                      </label>
                      <label className="checkbox-container">
                        <input
                          type="checkbox"
                          checked={formData.admission_concours_possible}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              admission_concours_possible: e.target.checked,
                            })
                          }
                        />
                        <span>Admission concours possible</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3 className="form-section-title">
                    <HiOutlineTag /> Mots-clés & Bac
                  </h3>
                  <div className="form-fields-grid">
                    <div className="form-group" style={{ gridColumn: "span 3" }}>
                      <label>Mots-clés (séparés par des virgules)</label>
                      <div className="input-with-icon">
                        <HiOutlineTag
                          className="input-icon"
                          style={{ top: "20px" }}
                        />
                        <textarea
                          placeholder="Ex: ingénierie, data science, web..."
                          value={formData.mots_cles_recherche}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              mots_cles_recherche: e.target.value,
                            })
                          }
                          rows="2"
                          style={{ paddingLeft: "50px", paddingTop: "15px" }}
                        />
                      </div>
                    </div>
                    <div className="form-group" style={{ gridColumn: "span 3" }}>
                      <label>Types de Bac requis (séparés par des virgules)</label>
                      <div className="input-with-icon">
                        <HiOutlineAcademicCap
                          className="input-icon"
                          style={{ top: "20px" }}
                        />
                        <textarea
                          placeholder="Ex: SM, PC, SVT..."
                          value={formData.prerequis_bac_type}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              prerequis_bac_type: e.target.value,
                            })
                          }
                          rows="2"
                          style={{ paddingLeft: "50px", paddingTop: "15px" }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3 className="form-section-title">
                    <HiOutlineDocumentText /> Présentation & Description
                  </h3>
                  <div className="form-fields-grid full-width">
                    <div className="form-group">
                      <label>Brève Description</label>
                      <div className="input-with-icon">
                        <HiOutlineDocumentText
                          className="input-icon"
                          style={{ top: "20px" }}
                        />
                        <textarea
                          placeholder="Résumé de l'établissement..."
                          value={formData.description}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              description: e.target.value,
                            })
                          }
                          rows="3"
                          style={{ paddingLeft: "50px", paddingTop: "15px" }}
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Présentation Détaillée</label>
                      <div className="input-with-icon">
                        <HiOutlineDocumentText
                          className="input-icon"
                          style={{ top: "20px" }}
                        />
                        <textarea
                          placeholder="Historique, missions, opportunités..."
                          value={formData.presentation}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              presentation: e.target.value,
                            })
                          }
                          rows="5"
                          style={{ paddingLeft: "50px", paddingTop: "15px" }}
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
                  {submitting
                    ? "Enregistrement..."
                    : editingSchool
                      ? "Sauvegarder les modifications"
                      : "Créer l'établissement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div
          className="modal-overlay"
          onClick={() => setDeleteConfirm({ show: false, id: null, name: "" })}
        >
          <div
            className="modal-content modal-confirm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="confirm-icon-danger">
              <HiOutlineExclamationTriangle />
            </div>
            <h2 className="confirm-title">Suppression irréversible</h2>
            <p className="confirm-message">
              Êtes-vous sûr de vouloir supprimer l'établissement <br />
              <span className="confirm-item-name">{deleteConfirm.name}</span> ?
              <br />
              <br />
              Toutes les données associées seront définitivement effacées.
            </p>

            {error && (
              <div className="alert-error" style={{ margin: "0 0 20px 0" }}>
                {error}
              </div>
            )}

            <div className="modal-actions" style={{ justifyContent: "center" }}>
              <button
                type="button"
                onClick={() =>
                  setDeleteConfirm({ show: false, id: null, name: "" })
                }
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
                {submitting ? "Suppression..." : "Confirmer la suppression"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSchools;
