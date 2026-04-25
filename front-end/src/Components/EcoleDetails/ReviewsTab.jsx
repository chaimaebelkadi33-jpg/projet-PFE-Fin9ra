import React, { useState } from "react";
import { useToast } from "../Toast";
import { HiOutlineXMark, HiOutlineEnvelope, HiOutlineLockClosed, HiOutlineCheckBadge, HiOutlineCheck, HiOutlineStar, HiStar } from "react-icons/hi2";

function ReviewsTab({ school, addReview, renderStars }) {
  const toast = useToast();
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: "",
    author: "",
    email: "",
  });

  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [tempReview, setTempReview] = useState(null);
  const [subscriptionMethod, setSubscriptionMethod] = useState(""); // 'email' or 'google'
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionEmail, setSubscriptionEmail] = useState("");

  const reviews = school.reviews || [];

  const calculateAverageRating = (reviews) => {
    if (!reviews || reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return Math.round((total / reviews.length) * 10) / 10;
  };

  const countReviewsByRating = (reviews) => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((review) => {
      const roundedRating = Math.round(review.rating);
      if (counts[roundedRating] !== undefined) {
        counts[roundedRating]++;
      }
    });
    return counts;
  };

  const handleStarClick = (rating) => {
    setNewReview((prev) => ({
      ...prev,
      rating: rating,
    }));
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();

    if (!newReview.comment.trim() || !newReview.author.trim()) {
      toast.warning("Veuillez remplir tous les champs requis");
      return;
    }

    // Check if user is subscribed
    if (!isSubscribed) {
      // Save the review temporarily and show subscription modal
      setTempReview({ ...newReview });
      setShowSubscriptionModal(true);
      return;
    }

    // If already subscribed, post the review directly
    addReview(newReview);

    // Reset form
    setNewReview({
      rating: 5,
      comment: "",
      author: "",
      email: "",
    });

    toast.success("Merci pour votre avis ! Il sera publié après modération.");
  };

  const handleSubscribeWithEmail = () => {
    if (!subscriptionEmail || !subscriptionEmail.includes("@")) {
      toast.warning("Veuillez entrer une adresse email valide");
      return;
    }

    // Simulate email subscription
    setIsSubscribed(true);
    setSubscriptionMethod("email");

    // Submit the review after subscription
    if (tempReview) {
      const reviewToSubmit = {
        ...tempReview,
        email: subscriptionEmail,
      };
      addReview(reviewToSubmit);

      // Reset form
      setNewReview({
        rating: 5,
        comment: "",
        author: "",
        email: "",
      });

      toast.success(
        "Merci pour votre inscription et votre avis ! Votre avis sera publié après modération."
      );
    }

    setShowSubscriptionModal(false);
    setTempReview(null);
    setSubscriptionEmail("");
  };

  const handleSubscribeWithGoogle = () => {
    // Simulate Google OAuth
    // In a real app, you would integrate with Google OAuth
    // For now, simulate successful login
    const mockGoogleEmail = `${newReview.author
      .toLowerCase()
      .replace(/\s+/g, ".")}@gmail.com`;

    setIsSubscribed(true);
    setSubscriptionMethod("google");

    if (tempReview) {
      const reviewToSubmit = {
        ...tempReview,
        email: mockGoogleEmail,
        verified: true,
      };
      addReview(reviewToSubmit);

      // Reset form
      setNewReview({
        rating: 5,
        comment: "",
        author: "",
        email: "",
      });

      toast.success(
        "Merci pour votre inscription avec Google ! Votre avis a été publié."
      );
    }

    setShowSubscriptionModal(false);
    setTempReview(null);
  };

  const closeSubscriptionModal = () => {
    setShowSubscriptionModal(false);
    setTempReview(null);
    setSubscriptionEmail("");
  };

  const skipSubscription = () => {
    // Allow posting without subscription but mark as unverified
    if (tempReview) {
      addReview({
        ...tempReview,
        verified: false,
      });

      // Reset form
      setNewReview({
        rating: 5,
        comment: "",
        author: "",
        email: "",
      });

      toast.info(
        "Votre avis a été soumis. Les avis non vérifiés peuvent être mis en attente de modération."
      );
    }

    setShowSubscriptionModal(false);
    setTempReview(null);
  };

  const averageRating = calculateAverageRating(reviews);
  const ratingCounts = countReviewsByRating(reviews);
  const totalReviews = reviews.length;

  return (
    <div className="reviews-tab">
      {/* Subscription Modal */}
      {showSubscriptionModal && (
        <div className="subscription-modal-overlay">
          <div className="subscription-modal">
            <div className="modal-header">
              <h3>Inscription Requise</h3>
                <HiOutlineXMark className="modal-close-icon-hi" onClick={closeSubscriptionModal} />
            </div>

            <div className="subscription-modal-content">
              <p className="modal-description">
                Pour publier un avis, nous vous recommandons de vous inscrire.
                Cela permet de vérifier votre identité et d'améliorer la
                crédibilité des avis.
              </p>

              <div className="subscription-options">
                <div className="subscription-option">
                  <div className="option-header">
                    <HiOutlineEnvelope className="option-icon-hi" />
                    <h4 className="option-title">Inscription par Email</h4>
                  </div>
                  <p className="option-description">
                    Inscrivez-vous avec votre adresse email
                  </p>
                  <div className="email-input-container">
                    <input
                      type="email"
                      placeholder="votre@email.com"
                      value={subscriptionEmail}
                      onChange={(e) => setSubscriptionEmail(e.target.value)}
                      className="email-input"
                    />
                  </div>
                  <button
                    onClick={handleSubscribeWithEmail}
                    className="subscribe-btn email-btn"
                  >
                    S'inscrire avec Email
                  </button>
                </div>

                <div className="subscription-option">
                  <div className="option-header">
                    <HiOutlineLockClosed className="option-icon-hi" />
                    <h4 className="option-title">Continuer avec Google</h4>
                  </div>
                  <p className="option-description">
                    Inscrivez-vous rapidement avec votre compte Google
                  </p>
                  <button
                    onClick={handleSubscribeWithGoogle}
                    className="subscribe-btn google-btn"
                  >
                    <span className="btn-icon">G</span>
                    S'inscrire avec Google
                  </button>
                </div>
              </div>

              <div className="modal-footer">
                <p className="privacy-notice">
                  En vous inscrivant, vous acceptez nos conditions d'utilisation
                  et notre politique de confidentialité.
                </p>

                <div className="modal-actions">
                  <button onClick={skipSubscription} className="skip-btn">
                    Publier sans inscription
                  </button>
                  <button
                    onClick={closeSubscriptionModal}
                    className="cancel-btn"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ratings Overview */}
      {reviews.length > 0 && (
        <div className="ratings-overview">
          <div className="overall-rating">
            <div className="rating-number-large">{averageRating}</div>
            <div className="rating-stars-large">
              {renderStars(averageRating)}
            </div>
            <div className="rating-count">{totalReviews} avis</div>
            {isSubscribed && (
              <div className="subscription-status">
                <span className="subscription-badge">
                  {subscriptionMethod === "email"
                    ? "📧 Inscrit"
                    : "🔐 Connecté Google"}
                </span>
              </div>
            )}
          </div>

          <div className="rating-breakdown">
            {[5, 4, 3, 2, 1].map((star) => (
              <div key={star} className="rating-row">
                <span className="star-label">{star} étoiles</span>
                <div className="rating-bar-container">
                  <div
                    className="rating-bar"
                    style={{
                      width:
                        totalReviews > 0
                          ? `${(ratingCounts[star] / totalReviews) * 100}%`
                          : "0%",
                    }}
                  ></div>
                </div>
                <span className="rating-count-small">{ratingCounts[star]}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Review Form */}
      <div className="add-review-section modern-light-review-container">
        <div className="review-form-header">
          <h3>Donner votre avis</h3>
          {isSubscribed && (
            <span className="already-subscribed">
              <HiOutlineCheckBadge className="check-icon-hi" /> Vous êtes connecté
            </span>
          )}
        </div>
        
        <form onSubmit={handleSubmitReview} className="modern-light-review-form">
          <div className="form-group rating-group">
            <label>Votre note globale :</label>
            <div className="rating-input modern-rating-box">
              <div className="stars-container">
                {renderStars(newReview.rating, handleStarClick)}
              </div>
              <span className="rating-value">{newReview.rating}/5</span>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="author">Votre nom ou pseudo :</label>
            <input
              type="text"
              id="author"
              className="modern-input"
              value={newReview.author}
              onChange={(e) =>
                setNewReview((prev) => ({
                  ...prev,
                  author: e.target.value,
                }))
              }
              placeholder="Ex: Sarah T."
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="comment">Votre expérience avec cet établissement :</label>
            <textarea
              id="comment"
              className="modern-textarea"
              value={newReview.comment}
              onChange={(e) =>
                setNewReview((prev) => ({
                  ...prev,
                  comment: e.target.value,
                }))
              }
              placeholder="Racontez-nous ce que vous avez particulièrement apprécié..."
              rows="5"
              required
            />
          </div>

          <div className="form-notice modern-info-banner">
            <p>
              💡 <strong>Note :</strong> Tous les avis sont soumis à modération avant d'être publiés pour garantir un espace respectueux.
            </p>
          </div>

          <div className="form-actions-submit">
            <button type="submit" className="btn-modern-light-submit">
              {isSubscribed
                ? "Soumettre mon avis"
                : "Se connecter pour publier"}
            </button>
          </div>
        </form>
      </div>

      {/* Reviews List */}
      <div className="reviews-list">
        <div className="reviews-header">
          <h3>Avis des étudiants</h3>
          <div className="verified-badges-info">
            <span className="verified-info"><HiOutlineCheckBadge className="badge-icon-hi" /> Avis vérifiés</span>
            <span className="unverified-info"><HiOutlineStar className="badge-icon-hi" /> Avis non vérifiés</span>
          </div>
        </div>
        {reviews.length === 0 ? (
          <div className="no-reviews">
            <p>
              Aucun avis pour le moment. Soyez le premier à donner votre avis !
            </p>
          </div>
        ) : (
          <div className="reviews-grid">
            {reviews.map((review) => (
              <div
                key={review.id}
                className={`review-card ${
                  review.verified ? "verified" : "unverified"
                }`}
              >
                <div className="review-header">
                  <div className="reviewer-info">
                    <span className="reviewer-avatar">
                      {review.author.charAt(0)}
                    </span>
                    <div className="reviewer-name-container">
                      <span className="reviewer-name">{review.author}</span>
                      {review.verified && (
                        <span className="verified-badge"><HiOutlineCheckBadge className="badge-icon-hi" /> Vérifié</span>
                      )}
                      {!review.verified && (
                        <span className="unverified-badge"><HiOutlineStar className="badge-icon-hi" /> Non vérifié</span>
                      )}
                    </div>
                  </div>
                  <div className="review-rating">
                    {renderStars(review.rating)}
                  </div>
                </div>

                <div className="review-content">
                  <p>{review.comment}</p>
                </div>

                <div className="review-footer">
                  <span className="review-date">
                    {new Date(review.date).toLocaleDateString("fr-FR")}
                  </span>
                  {review.email && (
                    <span className="review-email">
                      <HiOutlineEnvelope className="email-icon-hi" />{" "}
                      {review.email.includes("@gmail.com")
                        ? "Inscrit avec Google"
                        : "Inscrit par email"}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ReviewsTab;
