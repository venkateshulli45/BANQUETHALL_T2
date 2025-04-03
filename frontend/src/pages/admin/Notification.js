import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { useCookies } from 'react-cookie';
import { jwtDecode } from 'jwt-decode';
import styles from './vendorstyles/Notification.module.css';

const Notifications = ({ isDarkTheme }) => {
  const [notifications, setNotifications] = useState([]);
  const [cookies] = useCookies(['vendorToken']);
  
  const [loading, setLoading] = useState(true);
  const vendorEmail = jwtDecode(cookies.vendorToken).email; // Decode the vendor email from the token

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch(`http://localhost:8500/api/notifications/${vendorEmail}`);
        const data = await response.json();
        setNotifications(data);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    if (vendorEmail) fetchNotifications();
  }, [vendorEmail]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <FontAwesomeIcon 
          icon={faSpinner} 
          spin 
          size="2x" 
          color={isDarkTheme ? "#ff6b9d" : "#e91e63"} 
        />
        <p style={{ color: isDarkTheme ? "#b0b0b0" : "#666" }}>Loading notifications...</p>
      </div>
    );
  }

  return (
    <div className={styles.notificationsContainer}>
      <div className={styles.notificationsHeader}>
        <FontAwesomeIcon 
          icon={faBell} 
          className={styles.bellIcon} 
          color={isDarkTheme ? "#ff6b9d" : "#e91e63"} 
        />
        <h2 style={{ color: isDarkTheme ? "#ff6b9d" : "#e91e63" }}>Notifications</h2>
      </div>
      <div className={styles.notificationList}>
        {notifications.length > 0 ? (
          notifications.map((notif) => (
            <div className={styles.notificationItem} key={notif.id}>
              <div 
                className={styles.notificationIcon} 
                style={{
                  background: isDarkTheme ? "rgba(255, 107, 157, 0.1)" : "rgba(233, 30, 99, 0.1)",
                  color: isDarkTheme ? "#ff6b9d" : "#e91e63"
                }}
              >
                <FontAwesomeIcon icon={faBell} />
              </div>
              <div className={styles.notificationContent}>
                <h4 style={{ color: isDarkTheme ? "#ff6b9d" : "#e91e63" }}>Admin Notification</h4>
                <p>{notif.message}</p>
                <span className={styles.notificationTime}>
                  {new Date(notif.created_at).toLocaleString()}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.noNotifications}>
            <FontAwesomeIcon 
              icon={faBell} 
              className={styles.emptyIcon} 
              color={isDarkTheme ? "#555" : "#ccc"} 
            />
            <p style={{ color: isDarkTheme ? "#b0b0b0" : "#666" }}>No new notifications</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;