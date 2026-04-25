import React, { useState } from "react";
import { useToast } from "./Toast";
import { HiOutlineEnvelope, HiOutlinePhone, HiOutlineMapPin, HiOutlinePaperAirplane } from "react-icons/hi2";
import "../Styles/ContactPage.css";

const ContactPage = () => {
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement form submission logic
    toast.success(
      "Merci pour votre message ! Nous vous répondrons dans les plus brefs délais."
    );
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="contact-page">
      <div className="contact-hero">
        <h1 className="contact-title">Contactez-nous</h1>
        <p className="contact-subtitle">
          Nous sommes là pour vous aider à trouver la meilleure école
        </p>
      </div>

      <div className="contact-container">
        <div className="contact-info-section">
          <div className="contact-info-card">
            <h2 className="info-title">Informations de contact</h2>
            <p className="info-description">
              Pour toute question concernant notre plateforme ou pour obtenir de
              l'aide dans votre recherche d'école, n'hésitez pas à nous
              contacter.
            </p>

            <div className="contact-details">
              {/* Contact de Finn9ra */}
              <div className="contact-team">
                <h3 className="team-title">Contact de FinN9ra?</h3>

                <div className="contact-item">
                  <div className="contact-icon">
                    <HiOutlineEnvelope className="contact-icon-hi" />
                  </div>
                  <div className="contact-text">
                    <h4>Email</h4>
                    <p>contact@finn9ra.ma</p>
                  </div>
                </div>

                {/* Téléphone */}
                <div className="contact-item">
                  <div className="contact-icon">
                    <HiOutlinePhone className="contact-icon-hi" />
                  </div>
                  <div className="contact-text">
                    <h4>Téléphone</h4>
                    <p>+212 600-123456</p>
                  </div>
                </div>

                {/* Localisation */}
                <div className="contact-item">
                  <div className="contact-icon">
                    <HiOutlineMapPin className="contact-icon-hi" />
                  </div>
                  <div className="contact-text">
                    <h4>Localisation</h4>
                    <p>Maroc</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Formulaire de contact */}
        <div className="contact-form-section">
          <div className="contact-form-card">
            <h2 className="form-title">Envoyez-nous un message</h2>
            <p className="form-subtitle">
              Remplissez le formulaire ci-dessous et nous vous répondrons
              rapidement
            </p>

            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  Nom complet{" "}
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-input"
                  required
                  placeholder="Votre nom"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email{" "}
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                  required
                  placeholder="votre@email.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="subject" className="form-label">
                  Sujet{" "}
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="form-input"
                  required
                  placeholder="Objet de votre message"
                />
              </div>

              <div className="form-group">
                <label htmlFor="message" className="form-label">
                  Message{" "}
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className="form-textarea"
                  required
                  rows="6"
                  placeholder="Décrivez-nous votre demande..."
                />
              </div>

              <button type="submit" className="submit-btn">
                Envoyer le message
                <HiOutlinePaperAirplane className="send-icon-hi" strokeWidth={2} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
