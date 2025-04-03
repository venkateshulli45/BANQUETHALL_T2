import React from "react";
import { FaHeadset } from "react-icons/fa";
import styles from "./SupportSection.module.css";

const SupportSection = () => {
  return (
    <div className={styles.supportContainer}>
      <h3 className={styles.supportTitle}>
        <FaHeadset /> Support
      </h3>
      <p className={styles.supportText}>
        If you have any questions or need assistance, feel free to contact us at:
      </p>
      <a href="mailto:eventheaven@gmail.com" className={styles.supportEmail}>
        eventheaven@gmail.com
      </a>
    </div>
  );
};

export default SupportSection;