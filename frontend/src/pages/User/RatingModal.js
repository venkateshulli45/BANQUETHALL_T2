// RatingModal.js
import React, { useState } from 'react';
import styles from './RatingModal.module.css';

const RatingModal = ({ hall, booking, onClose, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [hover, setHover] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ hallId: hall.id, bookingId: booking.booking_id, rating, review });
    onClose();
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={onClose}>×</button>
        <h2>Rate Your Experience</h2>
        <p>How was your event at {hall.hall_name}?</p>
        
        <div className={styles.starRating}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              type="button"
              key={star}
              className={`${styles.star} ${star <= (hover || rating) ? styles.filled : ''}`}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(rating)}
            >
              ★
            </button>
          ))}
        </div>
        
        <form onSubmit={handleSubmit}>
          <textarea
            className={styles.reviewInput}
            placeholder="Share details about your experience (optional)"
            value={review}
            onChange={(e) => setReview(e.target.value)}
          />
          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={rating === 0}
          >
            Submit Rating
          </button>
        </form>
      </div>
    </div>
  );
};

export default RatingModal;