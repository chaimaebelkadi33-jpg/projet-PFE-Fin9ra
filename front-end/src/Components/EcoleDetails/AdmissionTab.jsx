import React from 'react';
import { HiOutlineBriefcase, HiOutlineBanknotes } from "react-icons/hi2";

function AdmissionTab({ school, expandedSections, toggleSection }) {
  // Récupérer les débouchés depuis les formations ou depuis school.debouches
  const debouches = school.debouches || [];
  
  // Extraire les débouchés potentiels des formations (optionnel)
  const formationsDebouches = school.formations?.filter(f => f.type === 'Débouché') || [];
  const allDebouches = debouches.length > 0 ? debouches : formationsDebouches.map(f => f.nom);

  return (
    <div className="admission-tab">
      {/* Conditions d'admission */}
      {(school.admission || school.dureeEtudes || school.diplome) && (
        <div className="admission-section">
          <h3>Conditions d'admission</h3>
          <div className="info-box">
            {school.admission && (
              <div className="info-row">
                <span className="info-label">Processus :</span>
                <span className="info-value">{school.admission}</span>
              </div>
            )}
            {school.dureeEtudes && (
              <div className="info-row">
                <span className="info-label">Durée :</span>
                <span className="info-value">{school.dureeEtudes}</span>
              </div>
            )}
            {school.diplome && (
              <div className="info-row">
                <span className="info-label">Diplôme :</span>
                <span className="info-value">{school.diplome}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Débouchés professionnels */}
      {allDebouches.length > 0 && (
        <div className="debouchés-section">
          <h3>Débouchés professionnels ({allDebouches.length})</h3>
          <div className="debouchés-grid">
            {allDebouches
              .slice(0, expandedSections.debouches ? undefined : 6)
              .map((debouché, index) => (
                <div key={index} className="debouché-card">
                  <HiOutlineBriefcase className="debouché-icon-hi" />
                  <span className="debouché-name">{debouché}</span>
                </div>
              ))}
          </div>
          {allDebouches.length > 6 && (
            <button 
              className="show-more-btn"
              onClick={() => toggleSection('debouches')}
            >
              {expandedSections.debouches ? 'Voir moins' : `Voir les ${allDebouches.length - 6} autres`}
            </button>
          )}
        </div>
      )}

      {/* Coûts */}
      {school.cout && school.cout !== "Information non spécifiée sur la page" && (
        <div className="cost-section">
          <h3>Coûts</h3>
          <div className="cost-card">
            <div className="cost-main">
              <HiOutlineBanknotes className="cost-icon-hi" />
              <div className="cost-details">
                <h4>Frais de scolarité annuels</h4>
                <p className="cost-amount">{school.cout}</p>
              </div>
            </div>
            <p className="cost-note">
              *Frais d'inscription supplémentaires peuvent s'appliquer
            </p>
          </div>
        </div>
      )}

      {/* Message si aucune information n'est disponible */}
      {!school.admission && !school.dureeEtudes && !school.diplome && allDebouches.length === 0 && (!school.cout || school.cout === "Information non spécifiée sur la page") && (
        <div className="no-info-message">
          <p>Aucune information d'admission n'est disponible pour cette école pour le moment.</p>
        </div>
      )}
    </div>
  );
}

export default AdmissionTab;