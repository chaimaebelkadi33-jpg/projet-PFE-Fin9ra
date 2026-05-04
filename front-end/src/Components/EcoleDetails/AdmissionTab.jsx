import React from 'react';
import { HiOutlineBriefcase, HiOutlineBanknotes, HiOutlineAcademicCap, HiOutlineScale, HiOutlineClock } from "react-icons/hi2";

function AdmissionTab({ school, expandedSections, toggleSection }) {
  // Fonction pour parser les tableaux JSON
  const parseJsonArray = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (typeof data === 'string') {
      try {
        return JSON.parse(data);
      } catch (e) {
        return [];
      }
    }
    return [];
  };

  // Fonction pour obtenir le label de la mention
  const getMentionLabel = (mention) => {
    const labels = {
      'Passable': 'Passable (10-12/20)',
      'Assez bien': 'Assez bien (12-14/20)',
      'Bien': 'Bien (14-16/20)',
      'Très bien': 'Très bien (16-20/20)'
    };
    return labels[mention] || mention;
  };

  const prerequisBacType = parseJsonArray(school.prerequis_bac_type);
  
  // Récupérer les débouchés
  const debouches = school.debouches || [];
  const allDebouches = debouches.length > 0 ? debouches : [];

  return (
    <div className="admission-tab">
      {/* Prérequis détaillés */}
      {(prerequisBacType.length > 0 || school.prerequis_bac_mention || school.bac_min_note) && (
        <div className="admission-section">
          <h3><HiOutlineAcademicCap /> Prérequis d'admission</h3>
          <div className="info-box">
            {prerequisBacType.length > 0 && (
              <div className="info-row">
                <span className="info-label">Baccalauréat requis :</span>
                <span className="info-value">{prerequisBacType.join(', ')}</span>
              </div>
            )}
            {school.prerequis_bac_mention && (
              <div className="info-row">
                <span className="info-label">Mention minimale :</span>
                <span className="info-value" style={{ fontWeight: 'bold' }}>{getMentionLabel(school.prerequis_bac_mention)}</span>
              </div>
            )}
            {school.bac_min_note && (
              <div className="info-row">
                <span className="info-label">Note minimale :</span>
                <span className="info-value" style={{ color: '#4a90e2', fontWeight: 'bold' }}>{school.bac_min_note}/20</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Conditions d'admission existantes */}
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
                <span className="info-value"><HiOutlineClock style={{ marginRight: '6px', display: 'inline' }} /> {school.dureeEtudes}</span>
              </div>
            )}
            {school.diplome && (
              <div className="info-row">
                <span className="info-label">Diplôme :</span>
                <span className="info-value"><HiOutlineAcademicCap style={{ marginRight: '6px', display: 'inline' }} /> {school.diplome}</span>
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
              .slice(0, expandedSections?.debouches ? undefined : 6)
              .map((debouché, index) => (
                <div key={index} className="debouché-card" style={{
                  background: 'white',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}>
                  <div style={{
                    background: '#f0fbff',
                    padding: '8px',
                    borderRadius: '8px',
                    color: '#00ced1',
                    display: 'flex'
                  }}>
                    <HiOutlineBriefcase style={{ fontSize: '18px' }} />
                  </div>
                  <span className="debouché-name" style={{ 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    color: '#002147' 
                  }}>{debouché}</span>
                </div>
              ))}
          </div>
          {allDebouches.length > 6 && (
            <button 
              className="show-more-btn"
              onClick={() => toggleSection?.('debouches')}
            >
              {expandedSections?.debouches ? 'Voir moins' : `Voir les ${allDebouches.length - 6} autres`}
            </button>
          )}
        </div>
      )}

      {/* Coûts */}
      {school.cout && school.cout > 0 && school.cout !== "Information non spécifiée sur la page" && (
        <div className="cost-section">
          <h3>Coûts</h3>
          <div className="cost-card">
            <div className="cost-main">
              <HiOutlineBanknotes className="cost-icon-hi" />
              <div className="cost-details">
                <h4>Frais de scolarité annuels</h4>
                <p className="cost-amount">{school.cout.toLocaleString()} MAD</p>
              </div>
            </div>
            <p className="cost-note">
              *Frais d'inscription supplémentaires peuvent s'appliquer
            </p>
          </div>
        </div>
      )}

      {/* Message si aucune information */}
      {!school.admission && !school.dureeEtudes && !school.diplome && allDebouches.length === 0 && (!school.cout || school.cout === "Information non spécifiée sur la page") && prerequisBacType.length === 0 && (
        <div className="no-info-message">
          <p>Aucune information d'admission n'est disponible pour cette école pour le moment.</p>
        </div>
      )}
    </div>
  );
}

export default AdmissionTab;