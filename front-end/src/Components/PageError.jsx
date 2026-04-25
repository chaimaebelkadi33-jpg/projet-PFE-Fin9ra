import React from 'react';
import { Link } from 'react-router-dom';
import '../Styles/PageError.css';    

const PageError = () => {
  return (
    <div className="error-page">
      <div className="error-content">
        <h1 className="error-title">404</h1>
        <h2 className="error-subtitle">Page Not Found</h2>
        <p className="error-message">Oops! The page you're looking for doesn't exist.</p>
        <Link to="/" className="error-home-link">Go Back Home</Link>
      </div>
    </div>
  );
};

export default PageError;