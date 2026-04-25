import React, { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
// import { adminGetPendingReviewsCount } from "../Services/api";
import "../Styles/header.css";
import logo from "../Assets/logo/logo.jpg";
import { 
  HiOutlineHome, 
  HiOutlineAcademicCap, 
  HiOutlineEnvelope, 
  HiOutlineChatBubbleBottomCenterText,
  HiOutlineArrowRightOnRectangle,
  HiOutlineArrowLeftOnRectangle,
  HiOutlineBars3,
  HiOutlineXMark
} from "react-icons/hi2";

const Header = () => {
  const [isFrench, setIsFrench] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();


  const toggleMenu = () => {
    const newMenuState = !isMenuOpen;
    setIsMenuOpen(newMenuState);

    if (newMenuState) {
      document.body.classList.add("mobile-nav-active");
      document.body.style.overflow = "hidden";
    } else {
      document.body.classList.remove("mobile-nav-active");
      document.body.style.overflow = "";
    }
  };

  const closeMobileMenu = () => {
    setIsMenuOpen(false);
    document.body.classList.remove("mobile-nav-active");
    document.body.style.overflow = "";
  };

  const handleLogout = async () => {
    await logout();
    closeMobileMenu();
    navigate("/");
  };

  useEffect(() => {
    return () => {
      document.body.classList.remove("mobile-nav-active");
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo et Titre */}
        <div className="brand-section">
          <NavLink to="/" className="brand-link" onClick={closeMobileMenu}>
            <div className="logo-container">
              <img
                src={logo}
                alt="Fin N9ra? Logo"
                className="logo-image"
                onError={(e) => {
                  e.target.style.display = "none";
                  const fallback = document.querySelector(".logo-fallback");
                  if (fallback) fallback.style.display = "block";
                }}
              />
              <div className="logo-fallback">FN</div>
            </div>
            <div className="brand-text">
              <h1 className="brand-title">FinN9ra?</h1>
              <p className="brand-subtitle">اختيار واضح... مستقبل أوضح</p>
            </div>
          </NavLink>
        </div>

        {/* Navigation */}
        <nav className="main-navigation">
          <ul className="nav-items">
            <li className="nav-item">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `nav-link ${isActive ? "active" : ""}`
                }
                onClick={closeMobileMenu}
              >
                <span className="nav-text">Accueil</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/ecoles"
                className={({ isActive }) =>
                  `nav-link ${isActive ? "active" : ""}`
                }
                onClick={closeMobileMenu}
              >
                <span className="nav-text">Écoles</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/contact"
                className={({ isActive }) =>
                  `nav-link ${isActive ? "active" : ""}`
                }
                onClick={closeMobileMenu}
              >
                <span className="nav-text">Contact</span>
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/About"
                className={({ isActive }) =>
                  `nav-link ${isActive ? "active" : ""}`
                }
                onClick={closeMobileMenu}
              >
                <span className="nav-text">A propos</span>
              </NavLink>
            </li>



            {/* Connexion / Déconnexion */}
            {isAuthenticated ? (
              <li className="nav-item login-item">
                <button onClick={handleLogout} className="logout-button">
                  <HiOutlineArrowRightOnRectangle className="nav-icon" />
                  <span className="login-text">Déconnexion</span>
                </button>
              </li>
            ) : (
              <li className="nav-item login-item">
                <NavLink
                  to="/login"
                  className="login-button"
                  onClick={closeMobileMenu}
                >
                  <HiOutlineArrowLeftOnRectangle className="nav-icon" />
                  <span className="login-text">Connexion</span>
                </NavLink>
              </li>
            )}
          </ul>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="mobile-toggle"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <HiOutlineXMark className="toggle-icon" /> : <HiOutlineBars3 className="toggle-icon" />}
        </button>
      </div>

      {/* Mobile Navigation Overlay */}
      <div className={`mobile-nav-overlay ${isMenuOpen ? "active" : ""}`}>
        <div className="mobile-nav-content">
          <div className="mobile-nav-header">
            <div className="mobile-brand-section">
              <div className="mobile-logo-container">
                <img src={logo} alt="Fin N9ra? Logo" className="mobile-logo-image" />
                <div className="mobile-logo-fallback">FN</div>
              </div>
              <div className="mobile-brand-text">
                <h2>FinN9ra?</h2>
              </div>
            </div>
          </div>

          <ul className="mobile-nav-items">
            <li className="mobile-nav-item">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `mobile-nav-link ${isActive ? "active" : ""}`
                }
                onClick={closeMobileMenu}
              >
                <HiOutlineHome className="mobile-nav-icon" />
                <span>Accueil</span>
              </NavLink>
            </li>
            <li className="mobile-nav-item">
              <NavLink
                to="/ecoles"
                className={({ isActive }) =>
                  `mobile-nav-link ${isActive ? "active" : ""}`
                }
                onClick={closeMobileMenu}
              >
                <HiOutlineAcademicCap className="mobile-nav-icon" />
                <span>Écoles</span>
              </NavLink>
            </li>
            <li className="mobile-nav-item">
              <NavLink
                to="/About"
                className={({ isActive }) =>
                  `mobile-nav-link ${isActive ? "active" : ""}`
                }
                onClick={closeMobileMenu}
              >
                <HiOutlineChatBubbleBottomCenterText className="mobile-nav-icon" />
                <span>A propos</span>
              </NavLink>
            </li>
            <li className="mobile-nav-item">
              <NavLink
                to="/contact"
                className={({ isActive }) =>
                  `mobile-nav-link ${isActive ? "active" : ""}`
                }
                onClick={closeMobileMenu}
              >
                <HiOutlineEnvelope className="mobile-nav-icon" />
                <span>Contact</span>
              </NavLink>
            </li>



            {/* Mobile - Login/Logout */}
            {isAuthenticated ? (
              <li className="mobile-nav-item">
                <button onClick={handleLogout} className="mobile-logout-btn">
                  <HiOutlineArrowRightOnRectangle className="mobile-nav-icon" />
                  <span>Déconnexion</span>
                </button>
              </li>
            ) : (
              <li className="mobile-nav-item">
                <NavLink
                  to="/login"
                  className="mobile-nav-link"
                  onClick={closeMobileMenu}
                >
                  <HiOutlineArrowLeftOnRectangle className="mobile-nav-icon" />
                  <span>Connexion</span>
                </NavLink>
              </li>
            )}
          </ul>
        </div>
      </div>
    </header>
  );
};

export default Header;