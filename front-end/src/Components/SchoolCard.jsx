import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { HiOutlineMapPin, HiOutlineArrowRight } from "react-icons/hi2";
import { IoHeart, IoHeartOutline } from "react-icons/io5";
import { getImageUrl, toggleFavorite } from "../Services/api";
import { useAuth } from "../Context/AuthContext";
import { useToast } from "./Toast";
import "../Styles/schoolCard.css";

function SchoolCard({ school }) {
  const { isAuthenticated, favorites, setFavorites } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  const schoolName = school.nom;
  const city = school.ville;
  const type = school.type;
  const id = Number(school.id);

  const isFavorited = favorites.includes(id);

  const schoolImage = getImageUrl(school.logo) || 
    "https://via.placeholder.com/300x200/4A90E2/FFFFFF?text=École";

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.info("Veuillez vous connecter pour ajouter des favoris");
      navigate("/login", { state: { from: location.pathname } });
      return;
    }

    const wasFavorited = isFavorited;
    
    // Optimistic update
    if (wasFavorited) {
      setFavorites(favorites.filter(favId => favId !== id));
    } else {
      setFavorites([...favorites, id]);
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
        setFavorites(wasFavorited ? [...favorites, id] : favorites.filter(favId => favId !== id));
        toast.error("Erreur lors de la mise à jour");
      }
    } catch (error) {
      // Revert on error
      setFavorites(wasFavorited ? [...favorites, id] : favorites.filter(favId => favId !== id));
      toast.error("Erreur lors de la mise à jour des favoris");
    }
  };

  return (
    <div className="school-card-wrapper">
      <Link to={`/ecole/${id}`} state={{ from: location.pathname + location.search }} className="school-card-link">
        <div className="school-card">
          <div className="card-image">
            <img src={schoolImage} alt={schoolName} className="school-img" />
          </div>

          <div className="card-content">
            <h3 className="school-name">{schoolName}</h3>
            <div className="card-info-row">
              <div className="type-badge">{type}</div>
              <button 
                className={`favorite-btn ${isFavorited ? 'active' : ''}`}
                onClick={handleFavoriteClick}
                title={isFavorited ? "Retirer des favoris" : "Ajouter aux favoris"}
              >
                {isFavorited ? <IoHeart /> : <IoHeartOutline />}
              </button>
            </div>
            <div className="school-location">
              <HiOutlineMapPin className="city-icon" />
              <span className="city-name">{city}</span>
            </div>
            <span className="voir-plus-btn">
              Voir plus <HiOutlineArrowRight className="arrow-icon" />
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}

export default React.memo(SchoolCard);