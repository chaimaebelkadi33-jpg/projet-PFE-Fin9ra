// src/Components/SchoolCard.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { HiOutlineMapPin, HiOutlineArrowRight } from "react-icons/hi2";
import "../Styles/schoolCard.css";

function SchoolCard({ school }) {
  // Get school data from props (adapté pour l'API Laravel)
  const location = useLocation();
  const schoolName = school.nom;
  const city = school.ville;
  const type = school.type;
  const description = school.description;
  
  // Les spécialités viennent maintenant de la relation 'formations'
  const specialties = school.formations?.map(f => f.nom) || [];
  const price = school.cout;
  const rating = school.note;
  
  // Utilisation de 'id' (standard Laravel) au lieu de 'idEcole'
  const id = school.id;

  const schoolImage =
    school.logo ||
    "https://via.placeholder.com/300x200/4A90E2/FFFFFF?text=École";

  return (
    <Link to={`/ecole/${id}`} state={{ from: location.pathname + location.search }} className="school-card-link">
      <div className="school-card">
        {/* School image */}
        <div className="card-image">
          <img src={schoolImage} alt={schoolName} className="school-img" />
        </div>

        {/* Card content - Simplified layout */}
        <div className="card-content">
          {/* School name - Top and larger */}
          <h3 className="school-name">{schoolName}</h3>

          {/* School type badge */}
          <div className="type-badge">{type}</div>

          {/* City/Location */}
          <div className="school-location">
            <HiOutlineMapPin className="city-icon" />
            <span className="city-name">{city}</span>
          </div>

          {/* "Voir plus" button */}
          <span className="voir-plus-btn">
            Voir plus <HiOutlineArrowRight className="arrow-icon" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export default React.memo(SchoolCard);