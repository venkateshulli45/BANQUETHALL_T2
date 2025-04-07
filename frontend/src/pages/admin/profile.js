import React, { useState, useEffect } from "react";
import styles from './vendorstyles/Profile.module.css';

const Profile = ({ vendorDetails, onUpdate, isDarkTheme }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    vendor_name: '',
    email: '',
    phone: '',
    city: ''
  });

  useEffect(() => {
    if (vendorDetails) {
      setFormData({
        vendor_name: vendorDetails.vendor_name || '',
        email: vendorDetails.email || '',
        phone: vendorDetails.phone || '',
        city: vendorDetails.city || ''
      });
    }
  }, [vendorDetails]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:8500/api/vendor/${vendorDetails.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('vendorToken')}`
        },
        body: JSON.stringify({
          vendor_name: formData.vendor_name,
          city: formData.city,
          phone: formData.phone
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const updatedVendor = await response.json();
      onUpdate(updatedVendor.vendor);
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Profile update error:", error);
      alert(`Error updating profile: ${error.message}`);
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
            <label htmlFor="vendor_name">Name:</label>
            <input
              type="text"
              id="vendor_name"
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
              readOnly
              className={`${styles.readOnlyInput} ${isDarkTheme ? styles.darkReadOnly : styles.lightReadOnly}`}
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
              pattern="[6-9]{1}[0-9]{9}"
              title="Indian mobile number (10 digits starting with 6-9)"
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
            <button type="submit" className={styles.saveBtn}>Save Changes</button>
            <button type="button" className={styles.cancelBtn} onClick={() => setIsEditing(false)}>Cancel</button>
          </div>
        </form>
      ) : (
        <div className={styles.profileDetails}>
          <div className={styles.profileField}><label>Name:</label><span>{formData.vendor_name}</span></div>
          <div className={styles.profileField}><label>Email:</label><span>{formData.email}</span></div>
          <div className={styles.profileField}><label>Phone:</label><span>{formData.phone}</span></div>
          <div className={styles.profileField}><label>City:</label><span>{formData.city}</span></div>
          <button className={styles.editBtn} onClick={() => setIsEditing(true)}>Edit Profile</button>
        </div>
      )}
    </div>
  );
};

export default Profile;
