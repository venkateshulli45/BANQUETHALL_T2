import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHistory, faSpinner, faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { useCookies } from "react-cookie";
import { jwtDecode } from "jwt-decode";
import styles from "./vendorstyles/History.module.css";

const History = ({ isDarkTheme }) => {
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [message, setMessage] = useState("");
  const [cookies] = useCookies(["vendorToken"]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const vendorEmail = jwtDecode(cookies.vendorToken).email; // Retrieve vendor email
        if (!vendorEmail) {
          setMessage("Vendor not logged in!");
          return;
        }

        const response = await axios.get(
          `http://localhost:8500/api/vendor/bookings/${vendorEmail}`
        );
        setBookings(response.data.bookings || []);
      } catch (error) {
        console.error("Error fetching vendor bookings:", error);
        setMessage("Failed to fetch booking history.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [cookies]);

  // Function to handle click and toggle booking details
  const handleBookingClick = (booking) => {
    if (selectedBooking && selectedBooking.booking_id === booking.booking_id) {
      setSelectedBooking(null); // Close if already selected
    } else {
      setSelectedBooking(booking);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <FontAwesomeIcon 
          icon={faSpinner} 
          spin 
          size="2x" 
          color={isDarkTheme ? "#ff6b9d" : "#e91e63"} 
        />
        <p style={{ color: isDarkTheme ? "#b0b0b0" : "#666" }}>Loading booking history...</p>
      </div>
    );
  }

  return (
    <div className={styles.historyContainer}>
      <div className={styles.historyHeader}>
        <FontAwesomeIcon 
          icon={faHistory} 
          className={styles.historyIcon} 
          color={isDarkTheme ? "#ff6b9d" : "#e91e63"} 
        />
        <h2 style={{ color: isDarkTheme ? "#ff6b9d" : "#e91e63" }}>Booking History</h2>
      </div>
      
      {message && <p className={styles.errorMessage}>{message}</p>}
      
      <div className={styles.historyList}>
        {bookings.length === 0 ? (
          <div className={styles.noBookings}>
            <FontAwesomeIcon 
              icon={faHistory} 
              className={styles.emptyIcon} 
              color={isDarkTheme ? "#555" : "#ccc"} 
            />
            <p style={{ color: isDarkTheme ? "#b0b0b0" : "#666" }}>No bookings found.</p>
          </div>
        ) : (
          bookings.map((booking) => (
            <div
              key={booking.booking_id}
              className={styles.historyItem}
              onClick={() => handleBookingClick(booking)}
            >
              <div className={styles.historyItemHeader}>
                <div 
                  className={styles.historyIcon} 
                  style={{
                    background: isDarkTheme ? "rgba(255, 107, 157, 0.1)" : "rgba(233, 30, 99, 0.1)",
                    color: isDarkTheme ? "#ff6b9d" : "#e91e63"
                  }}
                >
                  <FontAwesomeIcon icon={faHistory} />
                </div>
                
                <div className={styles.historyContent}>
                  <h4 style={{ color: isDarkTheme ? "#ff6b9d" : "#e91e63" }}>{booking.hall_name}</h4>
                  <p>Event: {booking.event_type}</p>
                  <p>Date: {new Date(booking.event_date).toLocaleDateString()}</p>
                  <p>Booking ID: {booking.booking_id}</p>
                </div>
                
                <div className={styles.expandIcon}>
                  <FontAwesomeIcon 
                    icon={selectedBooking?.booking_id === booking.booking_id ? faChevronUp : faChevronDown} 
                    color={isDarkTheme ? "#b0b0b0" : "#666"}
                  />
                </div>
              </div>

              {/* Show additional details when clicked */}
              {selectedBooking?.booking_id === booking.booking_id && (
                <div className={styles.bookingDetails}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Guests:</span>
                    <span className={styles.detailValue}>{booking.guests}</span>
                  </div>
                  
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Customer Name:</span>
                    <span className={styles.detailValue}>{booking.firstname} {booking.lastname}</span>
                  </div>
                  
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Mobile:</span>
                    <span className={styles.detailValue}>{booking.mobile}</span>
                  </div>
                  
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Alternate:</span>
                    <span className={styles.detailValue}>{booking.alternate || "N/A"}</span>
                  </div>
                  
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Total Price:</span>
                    <span className={styles.detailValue}>${booking.total_price}</span>
                  </div>
                  
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>User Email:</span>
                    <span className={styles.detailValue}>{booking.user_email}</span>
                  </div>
                  
                  {booking.additional_services && (
                    <div className={styles.additionalServices}>
                      <h5>Additional Services:</h5>
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
          ))
        )}
      </div>
    </div>
  );
};

export default History;