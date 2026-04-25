import React from 'react';
import { Link } from 'react-router-dom';
import '../Styles/footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container"> 
        <div className="footer-section">
          <div className="footer-logo">
            <h2 className="footer-title">Fin N9ra?</h2>
            <p className="footer-tagline">Plateforme intelligente pour aider les parents et étudiants à trouver la meilleure école au Maroc.</p>
          </div>
        </div>
        <div className="footer-sections">
          <div className="footer-section">
            <h3 className="section-title">Plateforme</h3>
            <ul className="footer-links">
              <li>
                <Link to="/" className="footer-link">Accueil</Link>
              </li>
              <li>
                <Link to="/ecoles" className="footer-link">Liste des écoles</Link>
              </li>
            </ul>
          </div>
          <div className="footer-section">
            <h3 className="section-title">À propos</h3>
            <ul className="footer-links">
              <li>
                <Link to="/about" className="footer-link">Qui sommes-nous</Link>
              </li>
              <li>
                <Link to="/contact" className="footer-link">Contact</Link>
              </li>
            </ul>
          </div>
          <div className="footer-section">
            <h3 className="section-title">Réseaux sociaux</h3>
            <div className="social-icons">
              <a href="https://www.facebook.com/" className="social-icon" aria-label="Facebook">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="https://www.instagram.com/" className="social-icon" aria-label="Instagram">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="https://x.com/" className="social-icon" aria-label="Twitter">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="https://www.linkedin.com/company/login/" className="social-icon" aria-label="LinkedIn">
                <i className="fab fa-linkedin-in"></i>
              </a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p className="copyright">
            © {new Date().getFullYear()} Fin N9ra? — Tous droits réservés
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;