import React from 'react';
import { HiOutlineRocketLaunch, HiOutlineBuildingLibrary, HiOutlineClock, HiOutlineAcademicCap, HiOutlineStar, HiOutlineBookOpen } from "react-icons/hi2";

function OverviewTab({ school }) {
  return (
    <div className="overview-tab">
      <div className="description-section">
        <h3><HiOutlineBookOpen className="presentation-icon-hi" /> Présentation</h3>
        <p className="school-description">
          {school.presentation || school.description}
        </p>
      </div>

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

      <div className="quick-info-grid">
        <div className="info-card">
          <HiOutlineBuildingLibrary className="info-icon-hi" />
          <div className="info-content">
            <h4>Type d'établissement</h4>
            <p>{school.type}</p>
          </div>
        </div>

        <div className="info-card">
          <HiOutlineClock className="info-icon-hi" />
          <div className="info-content">
            <h4>Durée des études</h4>
            <p>{school.dureeEtudes}</p>
          </div>
        </div>

        <div className="info-card">
          <HiOutlineAcademicCap className="info-icon-hi" />
          <div className="info-content">
            <h4>Diplôme délivré</h4>
            <p>{school.diplome}</p>
          </div>
        </div>

        <div className="info-card">
          <HiOutlineStar className="info-icon-hi" />
          <div className="info-content">
            <h4>Note moyenne</h4>
            <p>{school.note}/5</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OverviewTab;