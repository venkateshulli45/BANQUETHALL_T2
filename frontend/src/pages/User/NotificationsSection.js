import React from "react";
import { FaBell } from "react-icons/fa";
import styles from "./NotificationsSection.module.css";

const NotificationsSection = ({ notifications }) => {
  return (
    <div className={styles.notificationsContainer}>
      <h3 className={styles.notificationsTitle}>
        <FaBell /> Notifications
      </h3>
      {notifications.length === 0 ? (
        <p className={styles.emptyMessage}>No new notifications</p>
      ) : (
        <div className={styles.notificationsList}>
          {notifications.map((notification) => (
            <div key={notification.id} className={styles.notificationItem}>
              <p className={styles.notificationMessage}>{notification.message}</p>
              <span className={styles.notificationDate}>
                {new Date(notification.created_at).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsSection;