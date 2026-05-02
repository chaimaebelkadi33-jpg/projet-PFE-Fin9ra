import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { useToast } from "../Components/Toast";
import {
  getUserProfile,
  updateProfile,
  updatePassword,
  deleteReview,
  updateReview,
  toggleFavorite,
  getImageUrl,
} from "../Services/api";
import {
  HiOutlineUser,
  HiOutlineStar,
  HiStar,
  HiOutlineHeart,
  HiOutlineArrowRightOnRectangle,
  HiOutlinePencil,
  HiOutlineLockClosed,
  HiOutlineEnvelope,
  HiOutlineCalendarDays,
  HiOutlineTrash,
  HiOutlineBuildingLibrary,
  HiOutlineMapPin,
  HiOutlineChevronRight,
} from "react-icons/hi2";
import "../Styles/profile.css";
import "../Styles/admin.css";

const Profile = () => {
  const { user, logout, setFavorites, setUser } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState("account");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const [passwordData, setPasswordData] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });

  const [userReviews, setUserReviews] = useState([]);
  const [userFavorites, setUserFavorites] = useState([]);

  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editReviewData, setEditReviewData] = useState({
    rating: 5,
    comment: "",
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        email: user.email || "",
      });
      // Set initial avatar preview for existing avatar
      if (user?.avatar) {
        setAvatarPreview(getImageUrl(user.avatar));
      }
      loadProfileData();
    }
  }, [user]);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const response = await getUserProfile();
      if (response.data) {
        setUserReviews(response.data.reviews || []);
        setUserFavorites(response.data.favorites || []);
        // Update global favorites state
        if (response.data.favorites) {
          setFavorites(response.data.favorites.map((f) => f.id));
        }
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const formData = new FormData();
      formData.append("name", profileData.name);

      if (!user?.google_id) {
        formData.append("email", profileData.email);
      }

      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      const response = await updateProfile(formData);
      if (response.data.success) {
        toast.success("Profil mis à jour avec succès");
        // Update auth context user data to reflect changes, including avatar
        if (response.data.user) {
          setUser(response.data.user);
          // Update avatar preview if a new avatar was uploaded
          if (response.data.user.avatar) {
            setAvatarPreview(getImageUrl(response.data.user.avatar));
          }
        }
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Erreur lors de la mise à jour",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setAvatarFile(file);
    setAvatarPreview(previewUrl);

    try {
      setSaving(true);
      const formData = new FormData();
      formData.append("name", profileData.name || user?.name || "");

      if (!user?.google_id) {
        formData.append("email", profileData.email || user?.email || "");
      }

      formData.append("avatar", file);

      const response = await updateProfile(formData);
      if (response.data.success && response.data.user) {
        setUser(response.data.user);
        setAvatarFile(null);
        setAvatarPreview(getImageUrl(response.data.user.avatar));
        toast.success("Photo de profil mise à jour");
      }
    } catch (error) {
      setAvatarFile(null);
      setAvatarPreview(user?.avatar ? getImageUrl(user.avatar) : null);
      toast.error(
        error.response?.data?.message ||
          "Erreur lors de l'enregistrement de la photo",
      );
    } finally {
      setSaving(false);
      e.target.value = "";
      URL.revokeObjectURL(previewUrl);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwordData.password !== passwordData.password_confirmation) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    try {
      setSaving(true);
      const response = await updatePassword(passwordData);
      if (response.data.success) {
        toast.success("Mot de passe mis à jour");
        setPasswordData({
          current_password: "",
          password: "",
          password_confirmation: "",
        });
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Mot de passe actuel incorrect",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet avis ?"))
      return;
    try {
      await deleteReview(reviewId);
      setUserReviews((prev) => prev.filter((r) => r.id !== reviewId));
      toast.success("Avis supprimé");
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleEditClick = (review) => {
    setEditingReviewId(review.id);
    setEditReviewData({ rating: review.rating, comment: review.comment });
  };

  const handleCancelEdit = () => {
    setEditingReviewId(null);
  };

  const handleSaveEdit = async (reviewId) => {
    try {
      await updateReview(reviewId, editReviewData);

      setUserReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId ? { ...r, ...editReviewData, verified: false } : r,
        ),
      );
      toast.success("Avis modifié avec succès");
      setEditingReviewId(null);
    } catch (error) {
      toast.error("Erreur lors de la modification");
    }
  };

  const handleStarClick = (rating) => {
    setEditReviewData((prev) => ({ ...prev, rating }));
  };

  const handleRemoveFavorite = async (schoolId) => {
    try {
      const response = await toggleFavorite(schoolId);
      if (!response.data.is_favorited) {
        setUserFavorites((prev) => prev.filter((f) => f.id !== schoolId));
        setFavorites((prev) => prev.filter((id) => id !== schoolId));
        toast.success("Retiré des favoris");
      }
    } catch (error) {
      toast.error("Erreur lors de la modification");
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  if (loading && !user) {
    return (
      <div className="profile-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-user-info">
          <div
            className="profile-avatar"
            style={{ position: "relative", overflow: "hidden" }}
          >
            <label
              htmlFor="avatar-upload"
              style={{
                cursor: "pointer",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                height: "100%",
              }}
            >
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt={user?.name}
                  className="profile-avatar-img"
                />
              ) : user?.avatar ? (
                <img
                  src={getImageUrl(user.avatar)}
                  alt={user?.name}
                  className="profile-avatar-img"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="profile-initial">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              )}
              <div
                className="avatar-upload-overlay"
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  background: "rgba(0,0,0,0.6)",
                  color: "white",
                  padding: "6px",
                  borderRadius: "50%",
                  display: "flex",
                  margin: "5px",
                }}
              >
                <HiOutlinePencil size={16} />
              </div>
            </label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleAvatarChange}
            />
          </div>
          <div className="profile-name-details">
            <h1>{user?.name}</h1>
            <p>
              <HiOutlineEnvelope /> {user?.email}
            </p>
            <span className="registration-date">
              <HiOutlineCalendarDays /> Membre depuis le{" "}
              {new Date(user?.created_at).toLocaleDateString("fr-FR")}
            </span>
          </div>
        </div>
        <button onClick={handleLogout} className="btn-logout-profile">
          <HiOutlineArrowRightOnRectangle /> Déconnexion
        </button>
      </div>

      <div className="profile-tabs-nav">
        <button
          className={`tab-btn ${activeTab === "account" ? "active" : ""}`}
          onClick={() => setActiveTab("account")}
        >
          <HiOutlineUser /> Mon Compte
        </button>
        <button
          className={`tab-btn ${activeTab === "reviews" ? "active" : ""}`}
          onClick={() => setActiveTab("reviews")}
        >
          <HiOutlineStar /> Mes Avis ({userReviews.length})
        </button>
        <button
          className={`tab-btn ${activeTab === "favorites" ? "active" : ""}`}
          onClick={() => setActiveTab("favorites")}
        >
          <HiOutlineHeart /> Mes Favoris ({userFavorites.length})
        </button>
      </div>

      <div className="profile-tab-content">
        {activeTab === "account" && (
          <div className="account-settings">
            <div className="settings-card">
              <h3>
                <HiOutlinePencil /> Informations Personnelles
              </h3>
              <form onSubmit={handleUpdateProfile} className="profile-form">
                <div className="form-group">
                  <label>Nom complet</label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) =>
                      setProfileData({ ...profileData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) =>
                      setProfileData({ ...profileData, email: e.target.value })
                    }
                    required
                    disabled={!!user?.google_id}
                    style={{
                      backgroundColor: user?.google_id ? "#f0f0f0" : "inherit",
                      cursor: user?.google_id ? "not-allowed" : "text",
                    }}
                  />
                  {user?.google_id && (
                    <small
                      style={{
                        color: "#666",
                        marginTop: "4px",
                        display: "block",
                      }}
                    >
                      L'email ne peut pas être modifié pour un compte Google.
                    </small>
                  )}
                </div>
                <button type="submit" className="btn-save" disabled={saving}>
                  {saving
                    ? "Enregistrement..."
                    : "Sauvegarder les modifications"}
                </button>
              </form>
            </div>

            {!user?.google_id && (
              <div className="settings-card">
                <h3>
                  <HiOutlineLockClosed /> Sécurité
                </h3>
                <form onSubmit={handleUpdatePassword} className="profile-form">
                  <div className="form-group">
                    <label>Mot de passe actuel</label>
                    <input
                      type="password"
                      value={passwordData.current_password}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          current_password: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Nouveau mot de passe</label>
                    <input
                      type="password"
                      value={passwordData.password}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          password: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Confirmer le nouveau mot de passe</label>
                    <input
                      type="password"
                      value={passwordData.password_confirmation}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          password_confirmation: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <button type="submit" className="btn-save" disabled={saving}>
                    {saving ? "Mise à jour..." : "Changer le mot de passe"}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="user-reviews-list">
            {userReviews.length === 0 ? (
              <div className="empty-state">
                <HiOutlineStar />
                <p>Vous n'avez pas encore publié d'avis.</p>
                <button
                  onClick={() => navigate("/ecoles")}
                  className="btn-browse"
                >
                  Parcourir les écoles
                </button>
              </div>
            ) : (
              <div className="reviews-grid">
                {userReviews.map((review) => (
                  <div
                    key={review.id}
                    className={`user-review-card ${editingReviewId !== review.id ? "clickable" : ""}`}
                    onClick={(e) => {
                      if (editingReviewId !== review.id) {
                        navigate(`/ecole/${review.school_id}`, {
                          state: { tab: "reviews", reviewId: review.id },
                        });
                      }
                    }}
                  >
                    {editingReviewId === review.id ? (
                      <div
                        className="review-edit-form"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="school-mini-info mb-3">
                          <strong>{review.school?.nom}</strong>
                        </div>
                        <div className="rating-input modern-rating-box mb-3">
                          <div className="stars-container">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <HiStar
                                key={star}
                                className={`star interactive-star ${star <= editReviewData.rating ? "filled" : "empty-hi"}`}
                                onClick={() => handleStarClick(star)}
                              />
                            ))}
                          </div>
                        </div>
                        <textarea
                          className="modern-textarea mb-3"
                          value={editReviewData.comment}
                          onChange={(e) =>
                            setEditReviewData((prev) => ({
                              ...prev,
                              comment: e.target.value,
                            }))
                          }
                          rows="4"
                        />
                        <div className="edit-form-actions">
                          <button
                            onClick={handleCancelEdit}
                            className="btn-cancel"
                          >
                            Annuler
                          </button>
                          <button
                            onClick={() => handleSaveEdit(review.id)}
                            className="btn-save-review"
                          >
                            Enregistrer
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="review-card-header">
                          <div className="school-mini-info">
                            <strong>{review.school?.nom}</strong>
                            <span>{review.school?.ville}</span>
                          </div>
                          <div className="review-rating">
                            {[...Array(5)].map((_, i) => (
                              <HiStar
                                key={i}
                                className={
                                  i < review.rating ? "star filled" : "star"
                                }
                              />
                            ))}
                          </div>
                        </div>
                        <p className="review-comment">{review.comment}</p>
                        <div className="review-card-footer">
                          <span className="review-date">
                            {new Date(review.created_at).toLocaleDateString(
                              "fr-FR",
                            )}
                          </span>
                          <div className="review-actions">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditClick(review);
                              }}
                              className="btn-edit-review"
                            >
                              <HiOutlinePencil /> Modifier
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteReview(review.id);
                              }}
                              className="btn-delete-review"
                            >
                              <HiOutlineTrash /> Supprimer
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "favorites" && (
          <div className="user-favorites-list">
            {userFavorites.length === 0 ? (
              <div className="empty-state">
                <HiOutlineHeart />
                <p>Votre liste de favoris est vide.</p>
                <button
                  onClick={() => navigate("/ecoles")}
                  className="btn-browse"
                >
                  Ajouter des écoles
                </button>
              </div>
            ) : (
              <div className="favorites-grid">
                {userFavorites.map((school) => (
                  <div key={school.id} className="user-favorite-card">
                    <img src={getImageUrl(school.logo)} alt={school.nom} />
                    <div className="favorite-info">
                      <div className="favorite-header">
                        <h4>{school.nom}</h4>
                        <button
                          onClick={() => handleRemoveFavorite(school.id)}
                          className="btn-remove-fav"
                          title="Retirer des favoris"
                        >
                          <HiOutlineHeart className="heart-filled" />
                        </button>
                      </div>
                      <p className="school-meta">
                        <HiOutlineMapPin /> {school.ville} • {school.type}
                      </p>
                      <button
                        onClick={() => navigate(`/ecole/${school.id}`)}
                        className="btn-view-school"
                      >
                        Voir les détails <HiOutlineChevronRight />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
