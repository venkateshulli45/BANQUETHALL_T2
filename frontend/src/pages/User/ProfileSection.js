import React, { useState } from "react";
import { FaUser, FaEdit } from "react-icons/fa";
import styles from "./ProfileSection.module.css";

const ProfileSection = ({ user, isEditing, editFormData, handleInputChange, handleEditToggle, handleSaveChanges, message, isError }) => {
  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileCard}>
        <h3 className={styles.profileTitle}>Profile Information</h3>
        {isEditing ? (
          <div className={styles.editForm}>
            <input
              type="text"
              name="username"
              value={editFormData.username || ""}
              onChange={handleInputChange}
              placeholder="Name"
              className={styles.inputField}
            />
            <input
              type="email"
              name="email"
              value={editFormData.email || ""}
              onChange={handleInputChange}
              placeholder="Email"
              disabled
              className={styles.disabledInput}
            />
            <input
              type="text"
              name="phone"
              value={editFormData.phone || ""}
              onChange={handleInputChange}
              placeholder="Phone"
              className={styles.inputField}
            />
            <div className={styles.editActions}>
              <button className={styles.saveBtn} onClick={handleSaveChanges}>
                Save
              </button>
              <button className={styles.cancelBtn} onClick={handleEditToggle}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className={styles.profileIcon}>
              <FaUser />
            </div>
            <div className={styles.profileDetails}>
              <p className={styles.profileDetailItem}>
                <strong>Name:</strong> {user.username}
              </p>
              <p className={styles.profileDetailItem}>
                <strong>Email:</strong> {user.email}
              </p>
              <p className={styles.profileDetailItem}>
                <strong>Phone:</strong> {user.phone}
              </p>
            </div>
            <div className={styles.profileActions}>
              <button className={styles.editBtn} onClick={handleEditToggle}>
                <FaEdit /> Edit
              </button>
            </div>
          </>
        )}
        {message && (
          <p className={`${styles.message} ${isError ? styles.errorMessage : ""}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default ProfileSection;