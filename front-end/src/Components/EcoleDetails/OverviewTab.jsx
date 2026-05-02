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

function OverviewTab({ school }) {
  // Fonction pour obtenir le label de la catégorie
  const getCategoryLabel = (categorie) => {
    const labels = {
      'grande_ecole_ingenieur': { 
        label: 'Grande École d\'Ingénieurs', 
        color: '#00cde1',
        icon: <HiOutlineTrophy style={{ marginRight: '6px' }} />
      },
      'ecole_ingenieur_publique': { 
        label: 'École d\'Ingénieurs Publique', 
        color: '#4A90E2',
        icon: <HiOutlineAcademicCap style={{ marginRight: '6px' }} />
      },
      'ecole_ingenieur_privee': { 
        label: 'École d\'Ingénieurs Privée', 
        color: '#9b59b6',
        icon: <HiOutlineAcademicCap style={{ marginRight: '6px' }} />
      },
      'faculte_sciences': { 
        label: 'Faculté des Sciences', 
        color: '#27ae60',
        icon: <HiOutlineBeaker style={{ marginRight: '6px' }} />
      },
      'faculte_droit_economie': { 
        label: 'Faculté de Droit et Économie', 
        color: '#e67e22',
        icon: <HiOutlineScale style={{ marginRight: '6px' }} />
      },
      'faculte_lettres': { 
        label: 'Faculté des Lettres', 
        color: '#9b59b6',
        icon: <HiOutlineBookOpen style={{ marginRight: '6px' }} />
      },
      'ecole_commerce_gestion': { 
        label: 'École de Commerce et Gestion', 
        color: '#f1c40f',
        icon: <HiOutlineBriefcase style={{ marginRight: '6px' }} />
      },
      'ecole_architecture': { 
        label: 'École d\'Architecture', 
        color: '#3498db',
        icon: <HiOutlineBuildingLibrary style={{ marginRight: '6px' }} />
      },
      'ecole_sciences_appliquees': { 
        label: 'École des Sciences Appliquées', 
        color: '#1abc9c',
        icon: <HiOutlineWrench style={{ marginRight: '6px' }} />
      },
      'centre_formation': { 
        label: 'Centre de Formation', 
        color: '#95a5a6',
        icon: <HiOutlineCpuChip style={{ marginRight: '6px' }} />
      }
    };
    return labels[categorie] || { 
      label: 'Établissement', 
      color: '#7f8c8d',
      icon: <HiOutlineAcademicCap style={{ marginRight: '6px' }} />
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
      {(school.categorie_ecole || school.domaine_principal || school.short_name || school.a_internat === 1) && (
        <div className="classification-section" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {school.short_name && (
              <span style={{
                background: '#002147',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '8px',
                fontWeight: 'bold',
                fontSize: '14px'
              }}>
                {school.short_name}
              </span>
            )}
            {school.categorie_ecole && (
              <span style={{
                background: getCategoryLabel(school.categorie_ecole).color,
                color: 'white',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '14px',
                display: 'inline-flex',
                alignItems: 'center'
              }}>
                {getCategoryLabel(school.categorie_ecole).icon}
                {getCategoryLabel(school.categorie_ecole).label}
              </span>
            )}
            {school.domaine_principal && (
              <span style={{
                background: '#e3f2fd',
                color: '#1976d2',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                display: 'inline-flex',
                alignItems: 'center'
              }}>
                <HiOutlineAcademicCap style={{ marginRight: '6px' }} />
                Domaine: {school.domaine_principal}
              </span>
            )}
            {school.sous_domaine && (
              <span style={{
                background: '#f3e5f5',
                color: '#7b1fa2',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '14px',
                display: 'inline-flex',
                alignItems: 'center'
              }}>
                <HiOutlineBookOpen style={{ marginRight: '6px' }} />
                {school.sous_domaine}
              </span>
            )}
            {school.a_internat === 1 && (
              <span style={{
                background: '#e8f5e9',
                color: '#2e7d32',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '14px',
                display: 'inline-flex',
                alignItems: 'center'
              }}>
                <HiOutlineBuildingLibrary style={{ marginRight: '6px' }} />
                Internat disponible
              </span>
            )}
          </div>
        </div>
      )}

      {/* Description */}
      <div className="description-section">
        <h3><HiOutlineBookOpen className="presentation-icon-hi" /> Présentation</h3>
        <p className="school-description">
          {school.presentation || school.description}
        </p>
      </div>

      {/* Section prérequis */}
      {(prerequisBacType.length > 0 || school.prerequis_bac_mention || school.bac_min_note) && (
        <div className="prerequis-section" style={{
          background: '#f8f9fa',
          padding: '16px 20px',
          borderRadius: '12px',
          marginBottom: '24px'
        }}>
          <h3 style={{ color: '#002147', marginBottom: '12px', fontSize: '1.1rem', display: 'flex', alignItems: 'center' }}>
            <HiOutlineAcademicCap style={{ marginRight: '8px' }} />
            Prérequis d'admission
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            {prerequisBacType.length > 0 && (
              <div>
                <strong style={{ color: '#666', fontSize: '12px' }}>Baccalauréat requis</strong>
                <p style={{ margin: 0, color: '#002147' }}>
                  {prerequisBacType.join(', ')}
                </p>
              </div>
            )}
            {school.prerequis_bac_mention && (
              <div>
                <strong style={{ color: '#666', fontSize: '12px' }}>Mention minimale</strong>
                <p style={{ margin: 0, color: '#002147', fontWeight: 'bold' }}>
                  {getMentionLabel(school.prerequis_bac_mention)}
                </p>
              </div>
            )}
            {school.bac_min_note && (
              <div>
                <strong style={{ color: '#666', fontSize: '12px' }}>Note minimale</strong>
                <p style={{ margin: 0, color: '#e67e22', fontWeight: 'bold', fontSize: '16px' }}>{school.bac_min_note}/20</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Section mots-clés */}
      {motsCles.length > 0 && (
        <div className="keywords-section" style={{ marginBottom: '24px' }}>
          <h3 style={{ color: '#002147', marginBottom: '12px', fontSize: '1.1rem', display: 'flex', alignItems: 'center' }}>
            <HiOutlineRocketLaunch style={{ marginRight: '8px' }} />
            Domaines de spécialisation
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {motsCles.slice(0, 10).map((keyword, index) => (
              <span key={index} style={{
                background: '#eef2ff',
                color: '#4338ca',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '500'
              }}>
                #{keyword}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Quick Info Grid */}
      <div className="quick-info-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '16px', 
        marginBottom: '24px' 
      }}>
        <div className="info-card" style={{ 
          padding: '16px', 
          background: 'white', 
          borderRadius: '12px', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)' 
        }}>
          <HiOutlineBuildingLibrary className="info-icon-hi" style={{ fontSize: '24px', color: '#00cde1' }} />
          <div className="info-content">
            <h4 style={{ margin: '8px 0 4px', fontSize: '14px', color: '#666' }}>Type d'établissement</h4>
            <p style={{ margin: 0, fontWeight: 'bold', color: '#002147' }}>{school.type}</p>
          </div>
        </div>

        <div className="info-card" style={{ 
          padding: '16px', 
          background: 'white', 
          borderRadius: '12px', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)' 
        }}>
          <HiOutlineClock className="info-icon-hi" style={{ fontSize: '24px', color: '#00cde1' }} />
          <div className="info-content">
            <h4 style={{ margin: '8px 0 4px', fontSize: '14px', color: '#666' }}>Durée des études</h4>
            <p style={{ margin: 0, fontWeight: 'bold', color: '#002147' }}>{school.dureeEtudes}</p>
          </div>
        </div>

        <div className="info-card" style={{ 
          padding: '16px', 
          background: 'white', 
          borderRadius: '12px', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)' 
        }}>
          <HiOutlineAcademicCap className="info-icon-hi" style={{ fontSize: '24px', color: '#00cde1' }} />
          <div className="info-content">
            <h4 style={{ margin: '8px 0 4px', fontSize: '14px', color: '#666' }}>Diplôme délivré</h4>
            <p style={{ margin: 0, fontWeight: 'bold', color: '#002147' }}>{school.diplome}</p>
          </div>
        </div>

        <div className="info-card" style={{ 
          padding: '16px', 
          background: 'white', 
          borderRadius: '12px', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)' 
        }}>
          <HiOutlineStar className="info-icon-hi" style={{ fontSize: '24px', color: '#00cde1' }} />
          <div className="info-content">
            <h4 style={{ margin: '8px 0 4px', fontSize: '14px', color: '#666' }}>Note moyenne</h4>
            <p style={{ margin: 0, fontWeight: 'bold', color: '#002147' }}>{school.note}/5</p>
          </div>
        </div>

        {school.cout > 0 && (
          <div className="info-card" style={{ 
            padding: '16px', 
            background: 'white', 
            borderRadius: '12px', 
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)' 
          }}>
            <HiOutlineBriefcase className="info-icon-hi" style={{ fontSize: '24px', color: '#00cde1' }} />
            <div className="info-content">
              <h4 style={{ margin: '8px 0 4px', fontSize: '14px', color: '#666' }}>Frais annuels</h4>
              <p style={{ margin: 0, fontWeight: 'bold', color: '#002147' }}>{school.cout.toLocaleString()} MAD</p>
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