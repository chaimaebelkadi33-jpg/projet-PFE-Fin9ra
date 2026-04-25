import React from 'react';
import '../Styles/About.css'; 

const About = () => {
  return (
    <div className="about-container">
      <header className="about-header">
        <h1 className="about-title">À Propos de FinN9ra?</h1>
        <p className="about-subtitle">Découvrez notre mission, notre plateforme et notre équipe</p>
      </header>

      <section className="section">
        <h2 className="section-title about-platform-title">La Plateforme Fin N9ra</h2> {/* Modifié */}
        <div className="platform-description">
          <p>
            <strong>Fin N9ra?</strong> est une plateforme intelligente conçue pour aider les parents 
            et les étudiants marocains à trouver la meilleure école adaptée à leurs besoins et aspirations.
          </p>
          <p>
            Notre mission est de simplifier le processus de recherche d'écoles au Maroc en fournissant 
            des informations complètes, actualisées et fiables sur les établissements éducatifs à travers le pays.
          </p>
          <h3>Ce que nous offrons :</h3>
          <ul>
            <li>Base de données complète des écoles marocaines</li>
            <li>Informations sur les programmes et frais de scolarité</li>
            <li>Avis et évaluations des utilisateurs</li>
            <li>Outils de recherche avancée</li>
          </ul>
        </div>
      </section>
      
      <section className="section">
        <h2 className="section-title about-mission-title">Notre Vision & Mission</h2> {/* Modifié */}
        <div className="platform-description">
          <p>
            Nous croyons que chaque étudiant mérite d'avoir accès à une éducation de qualité 
            qui correspond à ses talents et ambitions. Notre plateforme vise à :
          </p>
          <ul>
            <li>Démocratiser l'accès à l'information sur l'éducation au Maroc</li>
            <li>Faciliter la prise de décision pour les familles</li>
            <li>Promouvoir la transparence dans le secteur éducatif</li>
            <li>Accompagner les étudiants dans leur parcours académique</li>
          </ul>
        </div>
      </section>

      <section className="section">
        <h2 className="section-title about-team-title">L'Équipe Derrière Fin N9ra</h2>
        <div className="team-grid">
          <div className="team-member">
            <div className="member-avatar">BW</div>
            <h3 className="member-name">BARRI Widad</h3>
            <p className="member-role">Développeuse Full-Stack</p>
            <p className="member-description">
              Étudiante en Développement Digital en établissement ISTAG BAB TIZIMI
            </p>
            <div className="member-links">
              <a href="mailto:widadbarri@gmail.com" className="member-link email-icon">
                <i></i>
              </a>
              <a href="https://www.linkedin.com/in/widad-barri-aa8b8838a?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app"  
                 target="_blank" rel="noopener noreferrer" className="member-link linkedin-icon">
                <i></i>
              </a>
            </div>
          </div>

          <div className="team-member">
            <div className="member-avatar">BC</div>
            <h3 className="member-name">BELKADI Chaimae</h3>
            <p className="member-role">Développeuse Full-Stack</p>
            <p className="member-description">
              Étudiante en Développement Digital en établissement ISTAG BAB TIZIMI
            </p>
            <div className="member-links">
              <a href="mailto:chaimaebelkadi@gmail.com" className="member-link email-icon">
                <i></i>
              </a>
              <a href="https://www.linkedin.com/in/chaimae-belkadi-2a72ab292?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app" 
                 target="_blank" rel="noopener noreferrer" className="member-link linkedin-icon">
                <i></i>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;