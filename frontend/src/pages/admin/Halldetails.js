import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import { jwtDecode } from 'jwt-decode';
import styles from './vendorstyles/Halldetail.module.css';

const RegisterHall = ({ isDarkTheme = false }) => {
  const [vendorEmail, setVendorEmail] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const fileInputRef = useRef(null);
  const [cookies] = useCookies(["vendorToken"]);
  const [vendor, setVendor] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const email = jwtDecode(cookies.vendorToken)?.email;
    if (email) {
      setVendorEmail(email);
    }
  }, []);

  const [formData, setFormData] = useState({
    hallName: "",
    city: "",
    location: "",
    capacity: "",
    price: "",
    description: "",
    images: [],
    services: {
      catering: false,
      cateringType: "",
      cateringPrice: "",
      photography: false,
      photographyPrice: "",
      decoration: false,
      decorationPrice: "",
      makeup: false,
      makeupPrice: "",
      djOrchestras: false,
      djOrchestrasPrice: "",
    },
  });

  const validateForm = () => {
    const errors = {};

    const capacityNum = parseInt(formData.capacity);
    if (isNaN(capacityNum)) {
      errors.capacity = "Capacity must be a number";
    } else if (capacityNum <= 0) {
      errors.capacity = "Capacity must be greater than 0";
    }

    const priceNum = parseFloat(formData.price);
    if (isNaN(priceNum)) {
      errors.price = "Price must be a number";
    } else if (priceNum <= 0) {
      errors.price = "Price must be greater than 0";
    }

    const serviceKeys = ['photographyPrice', 'decorationPrice', 'makeupPrice', 'djOrchestrasPrice', 'cateringPrice'];
    serviceKeys.forEach(key => {
      if (formData.services[key] && isNaN(parseFloat(formData.services[key]))) {
        errors[key] = "Must be a valid number";
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name in formData.services) {
      setFormData(prev => ({
        ...prev,
        services: {
          ...prev.services,
          [name]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + formData.images.length > 10) {
      alert("Maximum 10 images allowed");
      return;
    }

    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    if (imageFiles.length === 0) return;

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...imageFiles]
    }));

    const newPreviews = imageFiles.map(file => URL.createObjectURL(file));
    setPreviewImages(prev => [...prev, ...newPreviews]);
  };

  const handleDragEvents = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else {
      setIsDragging(false);
    }
  };

  const handleDrop = (e) => {
    handleDragEvents(e);
    const files = Array.from(e.dataTransfer.files);
    if (files.length) handleFileChange({ target: { files } });
  };

  const handleRemoveImage = (index) => {
    URL.revokeObjectURL(previewImages[index]);
    
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
    
    // Reset selected image if it was the deleted one
    if (selectedImageIndex === index) {
      setSelectedImageIndex(null);
    } else if (selectedImageIndex > index) {
      setSelectedImageIndex(selectedImageIndex - 1);
    }
  };

  const handleImageView = (index) => {
    setSelectedImageIndex(index);
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      services: {
        ...prev.services,
        [name]: checked,
        ...(!checked && name === 'catering' ? { 
          cateringType: "",
          cateringPrice: "" 
        } : {}),
        ...(!checked && name !== 'catering' ? { 
          [`${name}Price`]: "" 
        } : {})
      }
    }));
  };

  const handleCancel = () => {
    navigate("/vendorhomepage");
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    if (!formData.hallName || !formData.city || !formData.location || 
        !formData.description || formData.images.length === 0) {
      alert("Please fill all required fields");
      return;
    }
  
    navigate("/payment", { 
      state: { 
        formData,
        vendorEmail,
        vendorName: jwtDecode(cookies.vendorToken).name || "" 
      } 
    });
  };

  const triggerFileInput = () => fileInputRef.current.click();

  return (
    <div className={`${styles.registerHallContainer} ${isDarkTheme ? styles.darkTheme : styles.lightTheme}`}>
      <header className={styles.registerHallHeader}>
        <h1>Register Your Hall</h1>
      </header>
      
      <main className={styles.registerHallMain}>
        <form className={styles.registerHallForm} onSubmit={handleRegister}>
          <div className={styles.formGroup}>
            <label htmlFor="hallName">Hall Name *</label>
            <input
              type="text"
              id="hallName"
              name="hallName"
              value={formData.hallName}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="city">City *</label>
            <select
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
            >
              <option value="">Select City</option>
              <option value="Chennai">Chennai</option>
              <option value="Bangalore">Bangalore</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Kolkata">Kolkata</option>
              <option value="Kochi">Kochi</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="location">Location *</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="capacity">Capacity *</label>
            <input
              type="number"
              id="capacity"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              required
            />
            {validationErrors.capacity && (
              <span className={styles.error}>{validationErrors.capacity}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="price">Price (₹) *</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
            />
            {validationErrors.price && (
              <span className={styles.error}>{validationErrors.price}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Images * (Max 10)</label>
            <div 
              className={`${styles.dropZone} ${isDragging ? styles.dragActive : ''}`}
              onDragEnter={handleDragEvents}
              onDragLeave={handleDragEvents}
              onDragOver={handleDragEvents}
              onDrop={handleDrop}
              onClick={triggerFileInput}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                multiple
                style={{ display: 'none' }}
              />
              <p>Drag & drop images here or click to browse</p>
              <p>Supported formats: JPEG, PNG</p>
            </div>
            
            {previewImages.length > 0 && (
              <div className={styles.imagePreviewContainer}>
                {previewImages.map((src, index) => (
                  <div key={index} className={styles.imagePreview}>
                    <img 
                      src={src} 
                      alt={`Preview ${index}`} 
                      onClick={() => handleImageView(index)}
                    />
                    <button 
                      type="button" 
                      onClick={() => handleRemoveImage(index)}
                      className={styles.removeImageBtn}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedImageIndex !== null && (
            <div className={styles.imageViewerOverlay} onClick={() => setSelectedImageIndex(null)}>
              <div className={styles.imageViewerContainer}>
                <img 
                  src={previewImages[selectedImageIndex]} 
                  alt={`Full view ${selectedImageIndex}`} 
                  className={styles.fullSizeImage}
                />
                <button 
                  className={styles.closeImageViewerBtn}
                  onClick={() => setSelectedImageIndex(null)}
                >
                  ×
                </button>
              </div>
            </div>
          )}

          <div className={styles.formGroup}>
            <label>Additional Services</label>
            <div className={styles.servicesContainer}>
              <div className={styles.servicesGrid}>
                {['photography', 'decoration', 'makeup', 'djOrchestras'].map(service => (
                  <div key={service} className={styles.serviceItem}>
                    <label className={styles.serviceCheckbox}>
                      <input
                        type="checkbox"
                        name={service}
                        checked={formData.services[service]}
                        onChange={handleCheckboxChange}
                      />
                      <span>{service.charAt(0).toUpperCase() + service.slice(1)}</span>
                    </label>
                    {formData.services[service] && (
                      <div className={styles.servicePriceInput}>
                        <input
                          type="number"
                          placeholder="Price"
                          name={`${service}Price`}
                          value={formData.services[`${service}Price`]}
                          onChange={handleChange}
                        />
                        {validationErrors[`${service}Price`] && (
                          <span className={styles.error}>
                            {validationErrors[`${service}Price`]}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                
                <div className={styles.serviceItem}>
                  <label className={styles.serviceCheckbox}>
                    <input
                      type="checkbox"
                      name="catering"
                      checked={formData.services.catering}
                      onChange={handleCheckboxChange}
                    />
                    <span>Catering</span>
                  </label>
                  {formData.services.catering && (
                    <div className={styles.cateringOptions}>
                      <div className={styles.radioGroup}>
                        {['veg', 'non-veg', 'both'].map(type => (
                          <label key={type} className={styles.radioLabel}>
                            <input
                              type="radio"
                              name="cateringType"
                              value={type}
                              checked={formData.services.cateringType === type}
                              onChange={handleChange}
                            />
                            <span>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                          </label>
                        ))}
                      </div>
                      <div className={styles.servicePriceInput}>
                        <input
                          type="number"
                          placeholder="Price per plate"
                          name="cateringPrice"
                          value={formData.services.cateringPrice}
                          onChange={handleChange}
                        />
                        {validationErrors.cateringPrice && (
                          <span className={styles.error}>
                            {validationErrors.cateringPrice}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className={styles.formActions}>
            <button type="submit" className={styles.submitBtn}>
              Register Hall
            </button>
            <button 
              type="button" 
              className={styles.cancelBtn}
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default RegisterHall;