import React, { useState } from "react";
import {
  HiOutlineAcademicCap,
  HiOutlineChartBar,
  HiOutlineDocumentText,
  HiOutlineBeaker,
  HiOutlineBookOpen,
  HiOutlineMapPin,
  HiOutlineChevronDown,
  HiOutlineChevronRight,
} from "react-icons/hi2";
import "../../Styles/formationsTab.css";

function FormationsTab({ school }) {
  const [expandedFormation, setExpandedFormation] = useState(null);

  const formations = school?.formations || [];

  const parseSpecialites = (specialites) => {
    if (!specialites) return [];
    if (Array.isArray(specialites)) return specialites;
    if (typeof specialites === "string") {
      try {
        return JSON.parse(specialites);
      } catch (e) {
        return [];
      }
    }
    return [];
  };

  const formationsEnriched = formations.map((formation) => ({
    ...formation,
    specialitesList: parseSpecialites(formation.specialites),
    objectifsList: parseSpecialites(formation.objectifs),
    competencesList: parseSpecialites(formation.competences),
    debouchesList: parseSpecialites(formation.debouches),
  }));

  const filieres = formationsEnriched.filter(
    (f) =>
      f.type === "Filière" ||
      f.type === "Filière Gestion" ||
      f.type === "Filière Commerce",
  );

  const masters = formationsEnriched.filter(
    (f) => f.type === "Master Spécialisé" || f.type === "Master Universitaire",
  );

  const licences = formationsEnriched.filter(
    (f) => f.type === "Licence Professionnelle",
  );

  const specialites = formationsEnriched.filter((f) => f.type === "Spécialité");

  const autres = formationsEnriched.filter(
    (f) =>
      ![
        "Filière",
        "Filière Gestion",
        "Filière Commerce",
        "Master Spécialisé",
        "Master Universitaire",
        "Licence Professionnelle",
        "Spécialité",
      ].includes(f.type),
  );

  const toggleFormation = (index) => {
    setExpandedFormation(expandedFormation === index ? null : index);
  };

  const renderFormationList = (items, title, icon) => {
    if (items.length === 0) return null;

    return (
      <div className="formation-category">
        <h3 className="formation-category-title">
          {icon} {title} ({items.length})
        </h3>
        <div className="formations-list">
          {items.map((formation, idx) => {
            const uniqueId = `${title}-${formation.id || idx}`;
            const isExpanded = expandedFormation === uniqueId;
            const hasDetails = formation.specialitesList.length > 0;

            return (
              <div key={uniqueId} className="formation-item">
                <div
                  className={`formation-header ${hasDetails ? "clickable" : ""} ${isExpanded ? "expanded" : ""}`}
                  onClick={() => hasDetails && toggleFormation(uniqueId)}
                >
                  {hasDetails ? (
                    <span className="toggle-icon-hi">
                      {isExpanded ? <HiOutlineChevronDown /> : <HiOutlineChevronRight />}
                    </span>
                  ) : (
                    <HiOutlineMapPin className="pin-icon-hi" />
                  )}
                  <span className="formation-name">{formation.nom}</span>
                  
                  <div className="formation-badges-container">
                    {formation.niveau_acces && (
                      <span className="badge-base badge-niveau" title="Niveau d'accès">
                        {formation.niveau_acces}
                      </span>
                    )}
                    
                    {formation.duree_mois && (
                      <span className="badge-base badge-duree" title="Durée de la formation">
                        {formation.duree_mois} mois
                      </span>
                    )}

                    <span className="badge-base badge-type">
                      {formation.type || "Formation"}
                    </span>

                    {formation.specialitesList.length > 0 && (
                      <span className="badge-base badge-spec-count">
                        {formation.specialitesList.length} Spéc.
                      </span>
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="formation-details-expanded">
                    {formation.description && (
                      <div className="details-description">
                        <h4 className="details-subtitle">Description</h4>
                        <p className="description-text">{formation.description}</p>
                      </div>
                    )}

                    <div className="details-grid">
                      {formation.objectifsList.length > 0 && (
                        <div>
                          <h4 className="details-grid-title title-objectifs">Objectifs</h4>
                          <ul className="details-list">
                            {formation.objectifsList.map((obj, idx) => (
                              <li key={idx}>{obj}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {formation.competencesList.length > 0 && (
                        <div>
                          <h4 className="details-grid-title title-competences">Compétences visées</h4>
                          <ul className="details-list">
                            {formation.competencesList.map((comp, idx) => (
                              <li key={idx}>{comp}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {(formation.specialitesList.length > 0 || formation.debouchesList.length > 0) && (
                      <div className="details-tags-section">
                        {formation.specialitesList.length > 0 && (
                          <div className="tags-group">
                            <h4 className="details-subtitle">Spécialités disponibles</h4>
                            <div className="tags-list">
                              {formation.specialitesList.map((spec, idx) => (
                                <span key={idx} className="tag-base tag-specialite">{spec}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        {formation.debouchesList.length > 0 && (
                          <div className="tags-group">
                            <h4 className="details-subtitle">Débouchés spécifiques</h4>
                            <div className="tags-list">
                              {formation.debouchesList.map((deb, idx) => (
                                <span key={idx} className="tag-base tag-debouche">{deb}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {(formation.responsable_nom || formation.conditions_acces) && (
                      <div className="responsable-box">
                        {formation.conditions_acces && (
                          <div style={{ marginBottom: formation.responsable_nom ? "8px" : "0" }}>
                            <span className="responsable-label">Admission : </span>
                            <span className="responsable-value">{formation.conditions_acces}</span>
                          </div>
                        )}
                        {formation.responsable_nom && (
                          <div>
                            <span className="responsable-label">Responsable : </span>
                            <span className="responsable-value">{formation.responsable_nom}</span>
                            {formation.responsable_email && (
                              <span className="responsable-email"> ({formation.responsable_email})</span>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (formations.length === 0) {
    return (
      <div className="formations-tab">
        <div className="no-info-message">
          <p>Aucune formation n'est disponible pour cette école.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="formations-tab">
      <div className="formations-tree">
        <h3>
          <HiOutlineAcademicCap className="category-icon-hi" /> Formations &
          Spécialités
        </h3>

        {renderFormationList(
          filieres,
          "Filières",
          <HiOutlineChartBar className="category-icon-hi" />,
        )}
        {renderFormationList(
          masters,
          "Masters",
          <HiOutlineAcademicCap className="category-icon-hi" />,
        )}
        {renderFormationList(
          licences,
          "Licences Professionnelles",
          <HiOutlineDocumentText className="category-icon-hi" />,
        )}
        {renderFormationList(
          specialites,
          "Spécialités",
          <HiOutlineBeaker className="category-icon-hi" />,
        )}
        {renderFormationList(
          autres,
          "Autres Formations",
          <HiOutlineBookOpen className="category-icon-hi" />,
        )}
      </div>
    </div>
  );
}

export default FormationsTab;
