import React from 'react';
import { HiOutlineMap, HiOutlineMapPin, HiOutlineTruck } from "react-icons/hi2";
import OpenStreetMap from "../OpenStreetMap";

function MapsTab({ school }) {
  const getRegion = (city) => {
    const regions = {
      Rabat: "Rabat-Salé-Kénitra",
      Salé: "Rabat-Salé-Kénitra",
      Kénitra: "Rabat-Salé-Kénitra",
      Casablanca: "Casablanca-Settat",
      Marrakech: "Marrakech-Safi",
      Fès: "Fès-Meknès",
      Meknès: "Fès-Meknès",
      Tanger: "Tanger-Tétouan-Al Hoceïma",
      Tétouan: "Tanger-Tétouan-Al Hoceïma",
      Agadir: "Souss-Massa",
      Oujda: "Oriental",
    };
    return regions[city] || "Maroc";
  };

  return (
    <div className="maps-tab">
      <div className="maps-header">
        <h2><HiOutlineMap className="maps-title-icon-hi" /> Localisation de {school.nom}</h2>
        <p className="maps-subtitle">
          Trouvez l'établissement sur la carte interactive
        </p>
      </div>

      <OpenStreetMap
        city={school.ville}
        schoolName={school.nom}
        address={school.adresse}
      />

      <h3 className="location-info-title">Informations Géographiques</h3>

      <div className="info-grid">
        <div className="info-item">
          <span className="info-label">Ville :</span>
          <span className="info-value">{school.ville}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Région :</span>
          <span className="info-value">{getRegion(school.ville)}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Type :</span>
          <span className="info-value">{school.type}</span>
        </div>
      </div>

      <div className="action-buttons">
        <button
          className="action-btn"
          onClick={() =>
            window.open(
              `https://www.google.com/maps/search/${school.nom}+${school.ville}+Maroc`,
              "_blank"
            )
          }
        >
          <HiOutlineMapPin className="btn-icon-hi" /> Ouvrir dans Google Maps
        </button>
        <button
          className="action-btn"
          onClick={() =>
            window.open(
              `https://waze.com/ul?q=${school.nom}+${school.ville}+Maroc`,
              "_blank"
            )
          }
        >
          <HiOutlineTruck className="btn-icon-hi" /> Itinéraire Waze
        </button>
      </div>
    </div>
  );
}

export default MapsTab;