import React from "react";
import { FaCalendarCheck, FaChevronUp, FaChevronDown } from "react-icons/fa";
import styles from "./BookingsSection.module.css";

const BookingsSection = ({ bookings, expandedBooking, handleBookingClick }) => {
  const getStatusBadgeClass = (status) => {
    return status === "confirmed" || status === "paid" 
      ? styles.statusBadgeConfirmed 
      : styles.statusBadgePending;
  };

  return (
    <div className={styles.bookingsContainer}>
      <h3 className={styles.bookingsTitle}>My Bookings</h3>
      {bookings.length === 0 ? (
        <p className={styles.emptyMessage}>No bookings found.</p>
      ) : (
        <div className={styles.bookingsList}>
          {bookings.map((booking) => (
            <div
              key={booking.booking_id}
              className={`${styles.bookingCard} ${
                expandedBooking === booking.booking_id ? styles.bookingCardHover : ""
              }`}
            >
              <div 
                className={styles.bookingHeader}
                onClick={() => handleBookingClick(booking.booking_id)}
              >
                <div className={styles.bookingIcon}>
                  <FaCalendarCheck />
                </div>
                <div className={styles.bookingContent}>
                  <h4 className={styles.bookingTitle}>{booking.hall_name}</h4>
                  <p className={styles.bookingText}>Event: {booking.event_type}</p>
                  <p className={styles.bookingText}>
                    Date: {new Date(booking.event_date).toLocaleDateString()}
                  </p>
                  <span className={getStatusBadgeClass(booking.status)}>
                    {booking.status}
                  </span>
                </div>
                <div className={styles.expandIcon}>
                  {expandedBooking === booking.booking_id ? (
                    <FaChevronUp />
                  ) : (
                    <FaChevronDown />
                  )}
                </div>
              </div>

              {expandedBooking === booking.booking_id && (
                <div className={styles.bookingDetails}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Booking ID:</span>
                    <span className={styles.detailValue}>WAYVOBH{booking.booking_id}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Total Price:</span>
                    <span className={styles.detailValue}>₹{booking.total_price}</span>
                  </div>
                  {booking.additional_services && (
                    <div className={styles.additionalServices}>
                      <h5 className={styles.servicesTitle}>Additional Services:</h5>
                      <div className={styles.servicesList}>
                        {Object.entries(JSON.parse(booking.additional_services)).map(([key, value]) => (
                          <div className={styles.serviceItem} key={key}>
                            <span className={styles.serviceName}>{key}:</span>
                            <span className={styles.servicePrice}>₹{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookingsSection;