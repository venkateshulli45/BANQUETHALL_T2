import React, { useState, useEffect } from "react";
import styles from './vendorstyles/Profile.module.css';

const Profile = ({ vendorDetails, onUpdate, isDarkTheme }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [originalData, setOriginalData] = useState({});

  useEffect(() => {
    if (vendorDetails) {
      setFormData(vendorDetails);
      setOriginalData(vendorDetails);
    }
  }, [vendorDetails]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const vendorId = localStorage.getItem("vendorId");
      const response = await fetch(`http://localhost:8500/api/vendor/${vendorId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (response.ok) {
        alert("Profile updated successfully!");
        setOriginalData(formData);
        setIsEditing(false);
        onUpdate(formData);
      } else {
        alert("Error updating profile: " + result.message);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile.");
    }
  };

  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileHeader}>
        <h2 style={{ color: isDarkTheme ? "#ff6b9d" : "#e91e63" }}>Vendor Profile</h2>
      </div>
      {isEditing ? (
        <form onSubmit={handleSubmit} className={styles.profileDetails}>
          <div className={styles.profileField}>
            <label htmlFor="name">Name:</label>
            <input
              type="text"
              id="name"
              name="vendor_name"
              value={formData.vendor_name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className={styles.profileField}>
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              disabled
            />
          </div>
          <div className={styles.profileField}>
            <label htmlFor="phone">Phone:</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className={styles.profileField}>
            <label htmlFor="city">City:</label>
            <input
              id="city"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className={styles.buttonGroup}>
            <button type="submit" className={styles.saveBtn}>
              Save Changes
            </button>
            <button 
              type="button" 
              className={styles.cancelBtn}
              onClick={() => {
                setFormData(originalData);
                setIsEditing(false);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className={styles.profileDetails}>
          <div className={styles.profileField}>
            <label>Name:</label>
            <span>{formData.vendor_name}</span>
          </div>
          <div className={styles.profileField}>
            <label>Email:</label>
            <span>{formData.email}</span>
          </div>
          <div className={styles.profileField}>
            <label>Phone:</label>
            <span>{formData.phone}</span>
          </div>
          <div className={styles.profileField}>
            <label>City:</label>
            <span>{formData.city}</span>
          </div>
          <button 
            className={styles.editBtn}
            onClick={() => {
              setOriginalData(formData);
              setIsEditing(true);
            }}
          >
            Edit Profile
          </button>
        </div>
      )}
    </div>
  );
};

export default Profile;