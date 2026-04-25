import React, { useState } from "react";
import { 
  HiOutlineAcademicCap, 
  HiOutlineChartBar, 
  HiOutlineDocumentText, 
  HiOutlineBeaker, 
  HiOutlineBookOpen, 
  HiOutlineMapPin, 
  HiOutlineChevronDown, 
  HiOutlineChevronRight 
} from "react-icons/hi2";

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

  // Enrichir les formations avec leurs spécialités parsées
  const formationsEnriched = formations.map((formation) => ({
    ...formation,
    specialitesList: parseSpecialites(formation.specialites),
  }));

  // Séparer les formations par catégorie
  const filieres = formationsEnriched.filter(f => 
    f.type === "Filière" || f.type === "Filière Gestion" || f.type === "Filière Commerce"
  );
  
  const masters = formationsEnriched.filter(f => 
    f.type === "Master Spécialisé" || f.type === "Master Universitaire"
  );
  
  const licences = formationsEnriched.filter(f => 
    f.type === "Licence Professionnelle"
  );
  
  const specialites = formationsEnriched.filter(f => 
    f.type === "Spécialité"
  );
  
  const autres = formationsEnriched.filter(f => 
    !["Filière", "Filière Gestion", "Filière Commerce", "Master Spécialisé", "Master Universitaire", "Licence Professionnelle", "Spécialité"].includes(f.type)
  );

  const toggleFormation = (index) => {
    setExpandedFormation(expandedFormation === index ? null : index);
  };

  const renderFormationList = (items, title, icon) => {
    if (items.length === 0) return null;
    
    return (
      <div className="formation-category" style={{ marginBottom: "24px" }}>
        <h3 style={{ 
          color: "#002147", 
          marginBottom: "16px", 
          fontSize: "1.2rem",
          borderBottom: "2px solid #00cde1",
          display: "inline-block",
          paddingBottom: "5px"
        }}>
          {icon} {title} ({items.length})
        </h3>
        <div className="formations-list">
          {items.map((formation, idx) => {
            const uniqueId = `${title}-${formation.id || idx}`;
            return (
              <div
                key={uniqueId}
                className="formation-item"
                style={{ marginBottom: "12px" }}
              >
                <div
                  className="formation-header"
                  onClick={() =>
                    formation.specialitesList.length > 0 && toggleFormation(uniqueId)
                  }
                  style={{
                    cursor:
                      formation.specialitesList.length > 0
                        ? "pointer"
                        : "default",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "14px 16px",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "10px",
                    marginBottom: "4px",
                    transition: "all 0.2s ease",
                    borderLeft:
                      expandedFormation === uniqueId
                        ? "3px solid #00cde1"
                        : "3px solid transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (formation.specialitesList.length > 0) {
                      e.currentTarget.style.backgroundColor = "#e9ecef";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#f8f9fa";
                  }}
                >
                  {formation.specialitesList.length > 0 ? (
                    <span
                      style={{
                        fontSize: "14px",
                        color: "#002147",
                        fontWeight: "bold",
                      }}
                    >
                    {expandedFormation === uniqueId ? <HiOutlineChevronDown className="toggle-icon-hi" /> : <HiOutlineChevronRight className="toggle-icon-hi" />}
                    </span>
                  ) : (
                    <span
                      style={{
                        fontSize: "14px",
                        width: "20px",
                        color: "#00cde1",
                      }}
                    >
                      <HiOutlineMapPin className="pin-icon-hi" />
                    </span>
                  )}
                  <span
                    style={{
                      fontWeight: "600",
                      flex: 1,
                      color: "#002147",
                      fontSize: "15px",
                    }}
                  >
                    {formation.nom}
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      padding: "4px 10px",
                      borderRadius: "20px",
                      backgroundColor: "#e0e0e0",
                      color: "#555",
                    }}
                  >
                    {formation.type || "Formation"}
                  </span>
                  {formation.specialitesList.length > 0 && (
                    <span
                      style={{
                        fontSize: "12px",
                        color: "#fff",
                        backgroundColor: "#00cde1",
                        padding: "3px 10px",
                        borderRadius: "20px",
                        fontWeight: "500",
                      }}
                    >
                      {formation.specialitesList.length} spécialité(s)
                    </span>
                  )}
                </div>

                {expandedFormation === uniqueId &&
                  formation.specialitesList.length > 0 && (
                    <div
                      style={{
                        padding: "16px 16px 16px 45px",
                        marginBottom: "8px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "10px",
                          backgroundColor: "#f8f9fa",
                          padding: "12px 16px",
                          borderRadius: "10px",
                        }}
                      >
                        {formation.specialitesList.map((spec, specIdx) => (
                          <span
                            key={specIdx}
                            style={{
                              backgroundColor: "#e3f2fd",
                              color: "#1976d2",
                              padding: "6px 16px",
                              borderRadius: "25px",
                              fontSize: "13px",
                              fontWeight: "500",
                              display: "inline-block",
                            }}
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
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
        <h3 style={{ 
          color: "#002147", 
          marginBottom: "24px", 
          fontSize: "1.3rem",
          borderBottom: "2px solid #00cde1",
          display: "inline-block",
          paddingBottom: "5px"
        }}>
          <HiOutlineAcademicCap className="category-icon-hi" /> Formations & Spécialités
        </h3>

        {/* Filières */}
        {renderFormationList(filieres, "Filières", <HiOutlineChartBar className="category-icon-hi" />)}
        
        {/* Masters */}
        {renderFormationList(masters, "Masters", <HiOutlineAcademicCap className="category-icon-hi" />)}
        
        {/* Licences Professionnelles */}
        {renderFormationList(licences, "Licences Professionnelles", <HiOutlineDocumentText className="category-icon-hi" />)}
        
        {/* Spécialités */}
        {renderFormationList(specialites, "Spécialités", <HiOutlineBeaker className="category-icon-hi" />)}
        
        {/* Autres formations */}
        {renderFormationList(autres, "Autres Formations", <HiOutlineBookOpen className="category-icon-hi" />)}
      </div>
    </div>
  );
}

export default FormationsTab;