import React from 'react';
import { 
  HiOutlineRocketLaunch, 
  HiOutlineBuildingLibrary, 
  HiOutlineClock, 
  HiOutlineAcademicCap, 
  HiOutlineStar, 
  HiOutlineBookOpen,
  HiOutlineTrophy,
  HiOutlineBeaker,
  HiOutlineScale,
  HiOutlineBriefcase,
  HiOutlineWrench,
  HiOutlineCpuChip
} from "react-icons/hi2";
import "../../Styles/overviewTab.css";

function OverviewTab({ school }) {
  // Fonction pour obtenir le label de la catégorie
  const getCategoryLabel = (categorie) => {
    const labels = {
      'grande_ecole_ingenieur': { 
        label: 'Grande École d\'Ingénieurs', 
        color: '#00cde1',
        icon: <HiOutlineTrophy className="category-badge-icon" />
      },
      'ecole_ingenieur_publique': { 
        label: 'École d\'Ingénieurs Publique', 
        color: '#00ced1',
        icon: <HiOutlineAcademicCap className="category-badge-icon" />
      },
      'ecole_ingenieur_privee': { 
        label: 'École d\'Ingénieurs Privée', 
        color: '#9b59b6',
        icon: <HiOutlineAcademicCap className="category-badge-icon" />
      },
      'faculte_sciences': { 
        label: 'Faculté des Sciences', 
        color: '#27ae60',
        icon: <HiOutlineBeaker className="category-badge-icon" />
      },
      'faculte_droit_economie': { 
        label: 'Faculté de Droit et Économie', 
        color: '#e67e22',
        icon: <HiOutlineScale className="category-badge-icon" />
      },
      'faculte_lettres': { 
        label: 'Faculté des Lettres', 
        color: '#9b59b6',
        icon: <HiOutlineBookOpen className="category-badge-icon" />
      },
      'ecole_commerce_gestion': { 
        label: 'École de Commerce et Gestion', 
        color: '#f1c40f',
        icon: <HiOutlineBriefcase className="category-badge-icon" />
      },
      'ecole_architecture': { 
        label: 'École d\'Architecture', 
        color: '#00ced1',
        icon: <HiOutlineBuildingLibrary className="category-badge-icon" />
      },
      'ecole_sciences_appliquees': { 
        label: 'École des Sciences Appliquées', 
        color: '#1abc9c',
        icon: <HiOutlineWrench className="category-badge-icon" />
      },
      'centre_formation': { 
        label: 'Centre de Formation', 
        color: '#95a5a6',
        icon: <HiOutlineCpuChip className="category-badge-icon" />
      }
    };
    return labels[categorie] || { 
      label: 'Établissement', 
      color: '#7f8c8d',
      icon: <HiOutlineAcademicCap className="category-badge-icon" />
    };
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

  // Parser les tableaux JSON
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

  const prerequisBacType = parseJsonArray(school.prerequis_bac_type);
  const motsCles = parseJsonArray(school.mots_cles_recherche);

  return (
    <div className="overview-tab">
      {/* Section classification */}
      {(school.categorie_ecole || school.domaine_principal || school.short_name || school.a_internat) && (
        <div className="classification-section">
          <div className="classification-badges">
            {school.short_name && (
              <span className="badge-short-name">
                {school.short_name}
              </span>
            )}
            {school.categorie_ecole && (
              <span 
                className="badge-category"
                style={{
                  '--category-bg': getCategoryLabel(school.categorie_ecole).color,
                  '--category-shadow': `${getCategoryLabel(school.categorie_ecole).color}33`
                }}
              >
                {getCategoryLabel(school.categorie_ecole).icon}
                {getCategoryLabel(school.categorie_ecole).label}
              </span>
            )}
            {school.domaine_principal && (
              <span className="badge-domaine">
                <HiOutlineAcademicCap />
                {school.domaine_principal}
              </span>
            )}
            {school.sous_domaine && (
              <span className="badge-sous-domaine">
                <HiOutlineBookOpen />
                {school.sous_domaine}
              </span>
            )}
            {school.a_internat && (
              <span className="badge-internat">
                <HiOutlineBuildingLibrary />
                Internat
              </span>
            )}
          </div>
        </div>
      )}

      {/* Description */}
      <div className="description-section">
        <h3>
          <HiOutlineBookOpen /> 
          Présentation de l'établissement
        </h3>
        <p className="school-description">
          {school.presentation || school.description}
        </p>
      </div>

      {/* Section prérequis */}
      {(prerequisBacType.length > 0 || school.prerequis_bac_mention || school.bac_min_note) && (
        <div className="prerequis-section">
          <h3>
            <HiOutlineAcademicCap />
            Prérequis d'admission
          </h3>
          <div className="prerequis-grid">
            {prerequisBacType.length > 0 && (
              <div className="prerequis-item">
                <strong>Baccalauréat requis</strong>
                <p>{prerequisBacType.join(', ')}</p>
              </div>
            )}
            {school.prerequis_bac_mention && (
              <div className="prerequis-item">
                <strong>Mention minimale</strong>
                <p className="prerequis-mention-value">
                  {getMentionLabel(school.prerequis_bac_mention)}
                </p>
              </div>
            )}
            {school.bac_min_note && (
              <div className="prerequis-item">
                <strong>Note minimale</strong>
                <p className="note-minimale">{school.bac_min_note}/20</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Section mots-clés */}
      {motsCles.length > 0 && (
        <div className="keywords-section">
          <h3>
            <HiOutlineRocketLaunch />
            Domaines de spécialisation
          </h3>
          <div className="keywords-list">
            {motsCles.slice(0, 10).map((keyword, index) => (
              <span key={index} className="keyword-tag">
                #{keyword}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Quick Info Grid */}
      <div className="quick-info-grid">
        <div className="info-card card-type">
          <div className="info-icon-wrapper">
            <HiOutlineBuildingLibrary />
          </div>
          <div className="info-content">
            <h4>Type</h4>
            <p>{school.type}</p>
          </div>
        </div>

        <div className="info-card card-duration">
          <div className="info-icon-wrapper">
            <HiOutlineClock />
          </div>
          <div className="info-content">
            <h4>Durée d'études</h4>
            <p>{school.dureeEtudes}</p>
          </div>
        </div>

        <div className="info-card card-diploma">
          <div className="info-icon-wrapper">
            <HiOutlineAcademicCap />
          </div>
          <div className="info-content">
            <h4>Diplôme</h4>
            <p>{school.diplome}</p>
          </div>
        </div>

        {school.cout > 0 && (
          <div className="info-card card-cost">
            <div className="info-icon-wrapper">
              <HiOutlineBriefcase />
            </div>
            <div className="info-content">
              <h4>Frais/An</h4>
              <p>{school.cout.toLocaleString()} MAD</p>
            </div>
          </div>
        )}
      </div>

      {/* Section missions */}
      {school.missions && school.missions.length > 0 && (
        <div className="mission-section overview-section">
          <h3>Mission & Vision</h3>
          <div className="mission-content">
            <ul className="mission-list">
              {school.missions.map((mission, index) => (
                <li key={index} className="mission-item">
                  <HiOutlineRocketLaunch className="mission-icon-hi" />
                  <span className="mission-text">{mission}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default OverviewTab;