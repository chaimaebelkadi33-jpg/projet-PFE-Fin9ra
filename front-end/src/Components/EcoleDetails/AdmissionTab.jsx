import React from 'react';
import { HiOutlineBriefcase, HiOutlineBanknotes, HiOutlineAcademicCap, HiOutlineScale, HiOutlineClock } from "react-icons/hi2";
import "../../Styles/admissionTab.css";

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
                <span className="info-value" style={{ color: '#00ced1', fontWeight: 'bold' }}>{school.bac_min_note}/20</span>
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
                <div key={index} className="debouché-card">
                  <div className="debouché-icon-wrapper">
                    <HiOutlineBriefcase />
                  </div>
                  <span className="debouché-name">{debouché}</span>
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
      {(school.cout_public > 0 || school.cout_prive > 0) && (
        <div className="cost-section">
          <h3><HiOutlineBanknotes /> Frais de scolarité</h3>
          <div className="costs-grid">
            {school.cout_public > 0 && (
              <div className="cost-card cost-card-public">
                <div className="cost-main">
                  <div className="cost-details">
                    <h4 className="cost-title-public">Voie Publique / Concours</h4>
                    <p className="cost-amount">{school.cout_public.toLocaleString()} MAD <span style={{ fontSize: '14px', color: '#64748b' }}>/an</span></p>
                    {school.admission_concours_note_min > 0 && (
                      <p className="cost-note-admission">
                        Seuil d'accès estimé : <strong>{school.admission_concours_note_min}/20</strong>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
            {school.cout_prive > 0 && (
              <div className="cost-card cost-card-prive">
                <div className="cost-main">
                  <div className="cost-details">
                    <h4 className="cost-title-prive">Voie Privée / Parallèle</h4>
                    <p className="cost-amount">{school.cout_prive.toLocaleString()} MAD <span style={{ fontSize: '14px', color: '#64748b' }}>/an</span></p>
                    <p className="cost-note-admission">
                      Admission sur : <strong>Dossier & Entretien</strong>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          <p className="admission-cost-note">
            * Les frais indiqués sont à titre indicatif et peuvent varier selon l'année académique.
          </p>
        </div>
      )}

      {/* Legacy Coûts Fallback */}
      {!(school.cout_public > 0 || school.cout_prive > 0) && school.cout && school.cout > 0 && school.cout !== "Information non spécifiée sur la page" && (
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