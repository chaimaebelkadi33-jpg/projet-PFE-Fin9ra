import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import { useToast } from "../Toast";
import { getImageUrl } from "../../Services/api";
import { 
  HiOutlineUserCircle,
  HiOutlineCheckBadge, 
  HiOutlineStar, 
  HiStar,
  HiOutlineExclamationCircle 
} from "react-icons/hi2";

function ReviewsTab({ school, addReview, renderStars }) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: "",
  });

  const reviews = school.reviews || [];

  useEffect(() => {
    if (location.state?.reviewId && reviews.length > 0) {
      const reviewElement = document.getElementById(`review-${location.state.reviewId}`);
      if (reviewElement) {
        setTimeout(() => {
          reviewElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          reviewElement.classList.add('highlight-review');
          
          // Retirer la classe de surbrillance après l'animation
          setTimeout(() => {
            reviewElement.classList.remove('highlight-review');
          }, 3000);
        }, 100);
      }
    }
  }, [location.state, reviews]);

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

    if (!isAuthenticated) {
      toast.info("Veuillez vous connecter pour publier un avis");
      navigate("/login", { state: { from: location.pathname } });
      return;
    }

    if (!newReview.comment.trim()) {
      toast.warning("Veuillez entrer un commentaire");
      return;
    }

    // Submit review with user info from context
    addReview({
      ...newReview,
      author: user.name,
      email: user.email
    });

    // Reset form
    setNewReview({
      rating: 5,
      comment: "",
    });

    toast.success("Merci pour votre avis ! Il sera publié après modération.");
  };

  const averageRating = calculateAverageRating(reviews);
  const ratingCounts = countReviewsByRating(reviews);
  const totalReviews = reviews.length;

  return (
    <div className="reviews-tab">
      {/* Ratings Overview */}
      {reviews.length > 0 && (
        <div className="ratings-overview">
          <div className="overall-rating">
            <div className="rating-number-large">{averageRating}</div>
            <div className="rating-stars-large">
              {renderStars(averageRating)}
            </div>
            <div className="rating-count">{totalReviews} avis</div>
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
          {isAuthenticated ? (
            <span className="already-subscribed">
              <HiOutlineCheckBadge className="check-icon-hi" /> Connecté en tant que {user.name}
            </span>
          ) : (
            <span className="guest-info">
              <HiOutlineExclamationCircle className="info-icon-hi" /> Connectez-vous pour partager votre expérience
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
              {isAuthenticated
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
                id={`review-${review.id}`}
                className={`review-card ${
                  review.verified ? "verified" : "unverified"
                }`}
              >
                <div className="review-header">
                  <div className="reviewer-info">
                    <div className="reviewer-avatar-container">
                      {review.user?.avatar ? (
                        <img 
                          src={getImageUrl(review.user.avatar)} 
                          alt={review.user.name} 
                          className="reviewer-avatar-img"
                        />
                      ) : (
                        <div className="reviewer-avatar-placeholder">
                          {review.user?.name ? review.user.name.charAt(0).toUpperCase() : <HiOutlineUserCircle />}
                        </div>
                      )}
                    </div>
                    <div className="reviewer-name-container">
                      <span className="reviewer-name">{review.user?.name || "Utilisateur"}</span>
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
                    {new Date(review.created_at).toLocaleDateString("fr-FR")}
                  </span>
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
