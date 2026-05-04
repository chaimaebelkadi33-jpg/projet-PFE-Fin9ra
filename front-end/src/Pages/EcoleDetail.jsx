import { useState, useEffect, useCallback } from "react";
import { useToast } from "../Components/Toast";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  getSchoolById,
  getSchoolReviews,
  addReview,
  getImageUrl,
  toggleFavorite,
} from "../Services/api";
import {
  HiOutlineArrowLeft,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineStar,
  HiStar,
  HiOutlineAcademicCap,
  HiOutlineMap,
  HiOutlineHeart,
  HiHeart,
} from "react-icons/hi2";
import { useAuth } from "../Context/AuthContext";
import "../Styles/ecoleDetail.css";
import "../Styles/OpenStreetMap.css";

// Import tab components
import OverviewTab from "../Components/EcoleDetails/OverviewTab";
import FormationsTab from "../Components/EcoleDetails/FormationsTab";
import AdmissionTab from "../Components/EcoleDetails/AdmissionTab";
import ReviewsTab from "../Components/EcoleDetails/ReviewsTab";
import ContactTab from "../Components/EcoleDetails/ContactTab";
import MapsTab from "../Components/EcoleDetails/MapsTab";

function EcoleDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, favorites, setFavorites } = useAuth();
  const toast = useToast();

  const isFavorited = favorites.includes(parseInt(id));

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      toast.info("Veuillez vous connecter pour ajouter des favoris");
      navigate("/login", { state: { from: location.pathname } });
      return;
    }

    const schoolId = parseInt(id);
    const wasFavorited = isFavorited;

    // Optimistic update
    if (wasFavorited) {
      setFavorites(favorites.filter((favId) => favId !== schoolId));
    } else {
      setFavorites([...favorites, schoolId]);
    }

    try {
      const response = await toggleFavorite(id);
      if (response.data.success) {
        if (response.data.is_favorited) {
          toast.success("Ajouté aux favoris");
        } else {
          toast.success("Retiré des favoris");
        }
      } else {
        // Revert if success is false
        setFavorites(
          wasFavorited
            ? [...favorites, schoolId]
            : favorites.filter((favId) => favId !== schoolId),
        );
        toast.error("Erreur lors de la mise à jour");
      }
    } catch (error) {
      // Revert on error
      setFavorites(
        wasFavorited
          ? [...favorites, schoolId]
          : favorites.filter((favId) => favId !== schoolId),
      );
      toast.error("Erreur lors de la mise à jour des favoris");
    }
  };

  // Scroll en haut de page à chaque changement d'école
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, [id]);

  const [school, setSchool] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(location.state?.tab || "overview");
  const [expandedSections, setExpandedSections] = useState({});
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [error, setError] = useState(null);

  // Fonction pour revenir à la page précédente avec les filtres
  const goBack = () => {
    const from = location.state?.from;

    if (from) {
      navigate(from);
    } else {
      navigate("/ecoles");
    }
  };

  // Charger l'école et ses avis
  useEffect(() => {
    loadSchool();
    loadReviews();
  }, [id]);

  // Écouter les changements d'état de localisation pour la navigation par onglet
  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab);
    }
  }, [location.state]);

  const loadSchool = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getSchoolById(id);

      // Gestion des différentes structures de réponse
      let schoolData = null;
      if (response.data && response.data.data) {
        schoolData = response.data.data;
      } else if (response.data && response.data.success && response.data.data) {
        schoolData = response.data.data;
      } else {
        schoolData = response.data;
      }

      setSchool(schoolData);
    } catch (error) {
      console.error("Error loading school:", error);
      setError("Impossible de charger les informations de l'école");
      setSchool(null);
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    try {
      const response = await getSchoolReviews(id);

      // Gestion des différentes structures de réponse
      let reviewsData = [];
      if (response.data && response.data.data) {
        reviewsData = response.data.data;
      } else if (Array.isArray(response.data)) {
        reviewsData = response.data;
      } else {
        reviewsData = [];
      }

      setReviews(reviewsData);
    } catch (error) {
      console.error("Error loading reviews:", error);
      setReviews([]);
    }
  };

  // Get all images (logo + images array)
  const getAllImages = useCallback(() => {
    if (!school) return [];

    const existingImages = [school.logo, ...(school.images || [])]
      .filter((img) => img && img.trim() !== "")
      .map((img) => getImageUrl(img));

    if (existingImages.length > 0) {
      return existingImages;
    }

    if (school.logo) {
      return [school.logo];
    }

    return [
      `https://via.placeholder.com/800x400/4A90E2/FFFFFF?text=${encodeURIComponent(school.nom)}`,
    ];
  }, [school]);

  // Auto-slide effect
  useEffect(() => {
    if (!isHovering && school) {
      const allImages = getAllImages();
      if (allImages.length > 1) {
        const interval = setInterval(() => {
          setCurrentImageIndex(
            (prevIndex) => (prevIndex + 1) % allImages.length,
          );
        }, 4000);

        return () => clearInterval(interval);
      }
    }
  }, [isHovering, school, getAllImages]);

  const goToNextImage = useCallback(() => {
    if (school) {
      const allImages = getAllImages();
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % allImages.length);
    }
  }, [school, getAllImages]);

  const goToPrevImage = useCallback(() => {
    if (school) {
      const allImages = getAllImages();
      setCurrentImageIndex((prevIndex) =>
        prevIndex === 0 ? allImages.length - 1 : prevIndex - 1,
      );
    }
  }, [school, getAllImages]);

  const goToImage = useCallback((index) => {
    setCurrentImageIndex(index);
  }, []);

  const renderStars = (rating, onStarClick = null) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const isInteractive = typeof onStarClick === "function";

    for (let i = 1; i <= 5; i++) {
      const starKey = i;
      const commonProps = {
        key: starKey,
        className: `star ${isInteractive ? "interactive-star" : ""}`,
        onClick: isInteractive ? () => onStarClick(i) : null,
      };

      if (i <= fullStars) {
        stars.push(
          <HiStar
            {...commonProps}
            className={`${commonProps.className} full-hi`}
          />,
        );
      } else if (i === fullStars + 1 && hasHalfStar && !isInteractive) {
        // Half stars only show in display mode
        stars.push(
          <span key={i} className="star half-hi">
            <HiStar className="star-full-part" />
            <HiOutlineStar className="star-outline-part" />
          </span>,
        );
      } else {
        stars.push(
          <HiOutlineStar
            {...commonProps}
            className={`${commonProps.className} empty-hi`}
          />,
        );
      }
    }
    return stars;
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleAddReview = async (reviewData) => {
    if (!isAuthenticated) {
      toast.warning("Veuillez vous connecter pour laisser un avis");
      return;
    }

    try {
      const response = await addReview({
        school_id: parseInt(id),
        rating: reviewData.rating,
        comment: reviewData.comment,
      });

      await loadReviews();

      // Mise à jour de la note de l'école
      if (response.data && response.data.school_note) {
        setSchool((prev) => ({ ...prev, note: response.data.school_note }));
      } else if (
        response.data &&
        response.data.data &&
        response.data.data.school_note
      ) {
        setSchool((prev) => ({
          ...prev,
          note: response.data.data.school_note,
        }));
      }

      toast.success(
        "Merci pour votre avis ! Il sera publié après validation par notre équipe de modération.",
      );
    } catch (error) {
      if (error.response?.status === 422) {
        toast.warning("Vous avez déjà laissé un avis pour cette école");
      } else {
        console.error("Error adding review:", error);
        toast.error("Erreur lors de l'envoi de l'avis");
      }
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Chargement des informations de l'école...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="not-found-container">
        <h2>Erreur</h2>
        <p>{error}</p>
        <div className="back-navigation">
          <button onClick={goBack} className="back-button">
            <HiOutlineArrowLeft className="back-icon-hi" /> Retour à la liste
          </button>
        </div>
      </div>
    );
  }

  if (!school) {
    return (
      <div className="not-found-container">
        <h2>École non trouvée</h2>
        <p>L'école que vous recherchez n'existe pas ou a été déplacée.</p>
        <div className="back-navigation">
          <button onClick={goBack} className="back-button">
            <HiOutlineArrowLeft className="back-icon-hi" /> Retour à la liste
          </button>
        </div>
      </div>
    );
  }

  const allImages = getAllImages();
  const currentImage =
    allImages[currentImageIndex] ||
    school.logo ||
    "https://via.placeholder.com/800x400/4A90E2/FFFFFF?text=École";

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src =
      "https://via.placeholder.com/800x400/4A90E2/FFFFFF?text=" +
      encodeURIComponent(school.nom);
  };

  const shouldShowAdmissionTab =
    school.admission || school.debouches || school.cout;
  const shouldShowContactInfoTab =
    school.siteWeb || school.contact || school.telephone;

  return (
    <div className="ecole-details-container">
      {/* Back Navigation et Titre sur la même ligne */}
      <div className="header-top-row">
        <div className="back-navigation">
          <button onClick={goBack} className="back-button">
            <HiOutlineArrowLeft className="back-icon-hi" /> Retour à la liste
          </button>
        </div>
        <div className="school-header">
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "baseline",
              gap: "10px",
            }}
          >
            {school.short_name && (
              <span
                style={{
                  color: "#00ced1",
                  fontSize: "1.7rem",
                  fontWeight: "600",
                }}
              >
                {school.short_name}
              </span>
            )}
            <h1 className="school-title">: {school.nom}</h1>
          </div>
          <button
            className={`school-favorite-btn ${isFavorited ? "active" : ""}`}
            onClick={handleToggleFavorite}
            title={isFavorited ? "Retirer des favoris" : "Ajouter aux favoris"}
          >
            {isFavorited ? <HiHeart /> : <HiOutlineHeart />}
          </button>
        </div>
      </div>

      {/* School Image Slider */}
      <div className="header-section">
        <div
          className="main-image-container"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <img
            src={currentImage}
            alt={`${school.nom} - Image ${currentImageIndex + 1}`}
            className="main-image"
            onError={handleImageError}
          />

          {allImages.length > 1 && (
            <>
              <button
                className="nav-arrow prev-arrow"
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevImage();
                }}
                aria-label="Image précédente"
              >
                <HiOutlineChevronLeft />
              </button>
              <button
                className="nav-arrow next-arrow"
                onClick={(e) => {
                  e.stopPropagation();
                  goToNextImage();
                }}
                aria-label="Image suivante"
              >
                <HiOutlineChevronRight />
              </button>
            </>
          )}

          {allImages.length > 1 && (
            <div className="image-indicators">
              {allImages.map((_, index) => (
                <button
                  key={index}
                  className={`indicator ${
                    index === currentImageIndex ? "active" : ""
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    goToImage(index);
                  }}
                  aria-label={`Aller à l'image ${index + 1}`}
                />
              ))}
            </div>
          )}

          {allImages.length > 1 && (
            <div className="image-counter">
              {currentImageIndex + 1} / {allImages.length}
            </div>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="tabs-navigation">
        <button
          className={`tab-button ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          Aperçu
        </button>

        <button
          className={`tab-button ${activeTab === "formations" ? "active" : ""}`}
          onClick={() => setActiveTab("formations")}
        >
          <HiOutlineAcademicCap className="tab-icon-hi" /> Formations &
          Spécialités ({school.formations?.length || 0})
        </button>

        {shouldShowAdmissionTab && (
          <button
            className={`tab-button ${activeTab === "admission" ? "active" : ""}`}
            onClick={() => setActiveTab("admission")}
          >
            Admission & Débouchés
          </button>
        )}

        <button
          className={`tab-button ${activeTab === "reviews" ? "active" : ""}`}
          onClick={() => setActiveTab("reviews")}
        >
          <HiOutlineStar className="tab-icon-hi" /> Avis ({reviews.length})
        </button>

        {shouldShowContactInfoTab && (
          <button
            className={`tab-button ${activeTab === "contact" ? "active" : ""}`}
            onClick={() => setActiveTab("contact")}
          >
            Contact & Infos
          </button>
        )}

        <button
          className={`tab-button ${activeTab === "maps" ? "active" : ""}`}
          onClick={() => setActiveTab("maps")}
        >
          <HiOutlineMap className="tab-icon-hi" /> Carte
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === "overview" && <OverviewTab school={school} />}
        {activeTab === "formations" && <FormationsTab school={school} />}
        {activeTab === "admission" && <AdmissionTab school={school} />}
        {activeTab === "reviews" && (
          <ReviewsTab
            school={{ ...school, reviews }}
            addReview={handleAddReview}
            renderStars={renderStars}
          />
        )}
        {activeTab === "contact" && <ContactTab school={school} />}
        {activeTab === "maps" && <MapsTab school={school} />}
      </div>

      {/* Floating Action Button */}
      {school.siteWeb && (
        <div className="floating-action">
          <button
            className="floating-action-btn"
            onClick={() => window.open(school.siteWeb, "_blank")}
          >
            Site Web
          </button>
        </div>
      )}
    </div>
  );
}

export default EcoleDetails;
