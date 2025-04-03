import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./homedetails.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot, faTimes, faCalendarAlt, faUtensils, faCamera, faMusic, faPaintBrush, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import Navbar from "./Navbar";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";

import { useCookies } from "react-cookie";
import { jwtDecode } from "jwt-decode";

const HomeDetails = () => {
    const location = useLocation();
    const [cookies] = useCookies(['authToken'])
    const navigate = useNavigate();
    const hall = location.state?.hall;
    
    const [mainImage, setMainImage] = useState(hall.images[0]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [bookedDates, setBookedDates] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [dateError, setDateError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
    const [formData, setFormData] = useState({ 
        firstname: "",
        lastname: "",
        email: "",
        mobile: "",
        alternate: "",
        event_type: "",
        guests: ""
    });
    const [selectedServices, setSelectedServices] = useState([]);

    const availableServices = ["Catering", "Decoration", "Photography", "Music"];
    
    // Event type options
    const eventTypes = ["Wedding", "Birthday", "Engagement", "Corporate Event", "Anniversary", "Conference", "Other"];

    useEffect(() => {
        const user = cookies.authToken ? jwtDecode(cookies.authToken) : null;
        
        if (user) {
            setIsUserLoggedIn(true);
            setFormData(prev => ({
                ...prev,
                firstname: user.username?.split(' ')[0] || "",
                lastname: user.username?.split(' ')[1] || "",
                email: user.email || "",
                mobile: user.phone || ""
            }));
        }

        const fetchBookedDates = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(
                    `http://localhost:8500/api/halls/${hall.id}/availability`
                );
                
                if (!response.ok) {
                    throw new Error('Failed to fetch availability');
                }
                
                const dates = await response.json();
                setBookedDates(dates.map(date => new Date(date)));
            } catch (error) {
                console.error("Error fetching booked dates:", error);
                setDateError("Error loading availability. Please refresh the page.");
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchBookedDates();
    }, [hall.id, cookies.authToken]);

    const handleDateChange = async (date) => {
        setSelectedDate(date);
        setDateError("");
        
        try {
            setIsLoading(true);
            const formattedDate = format(date, 'yyyy-MM-dd');
            const response = await fetch(
                `http://localhost:8500/api/halls/${hall.id}/check-availability?date=${formattedDate}`
            );
            
            if (!response.ok) {
                throw new Error('Failed to check availability');
            }
            
            const { available, message } = await response.json();
            
            if (!available) {
                setDateError(message || "This date is already booked. Please select another date.");
            }
        } catch (error) {
            console.error("Error checking availability:", error);
            setDateError(error.message || "Error checking availability. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const isDateBooked = (date) => {
        return bookedDates.some(
            bookedDate => bookedDate.toDateString() === date.toDateString()
        );
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleServiceChange = (service) => {
        setSelectedServices(prev => 
            prev.includes(service) 
                ? prev.filter(s => s !== service)  // Remove if already selected
                : [...prev, service] // Add if not selected
        );
    };
    
    const getServiceIcon = (service) => {
        switch(service.toLowerCase()) {
            case 'catering': return <FontAwesomeIcon icon={faUtensils} />;
            case 'photography': return <FontAwesomeIcon icon={faCamera} />;
            case 'decoration': return <FontAwesomeIcon icon={faPaintBrush} />;
            case 'music': case 'djorchestras': return <FontAwesomeIcon icon={faMusic} />;
            default: return null;
        }
    };

    const handleBooking = async (e) => {
        e.preventDefault();
        const user = cookies.authToken ? jwtDecode(cookies.authToken) : null;
      
        if (!user) {
          setError("Please login to proceed with booking.");
          navigate("/userLogin");
          return;
        }
      
        if (dateError || !selectedDate) {
          setError("Please select a valid available date.");
          return;
        }
      
        if (!formData.firstname || !formData.lastname || !formData.mobile || !formData.guests || !formData.event_type) {
          setError("Please fill all required fields.");
          return;
        }
      
        // Calculate total price including services
        let totalPrice = parseFloat(hall.price);
        let additionalServices = {};
        
        if (selectedServices.length > 0) {
          selectedServices.forEach(service => {
            const serviceKey = service.toLowerCase();
            if (serviceKey === 'catering' && hall.services.cateringPrice) {
              // Calculate catering based on number of guests
              const cateringCost = parseFloat(hall.services.cateringPrice) * parseInt(formData.guests);
              additionalServices[serviceKey] = cateringCost;
              totalPrice += cateringCost;
            } else if (hall.services[`${serviceKey}Price`]) {
              const servicePrice = parseFloat(hall.services[`${serviceKey}Price`]);
              additionalServices[serviceKey] = servicePrice;
              totalPrice += servicePrice;
            }
          });
        }
      
        navigate("/UserPayment", { 
          state: { 
            hall, 
            bookingDate: format(selectedDate, 'yyyy-MM-dd'),
            selectedServices,
            totalPrice: totalPrice.toFixed(2),
            formData: {
              ...formData,
              email: user.email, 
              hall_id: hall?.id || hall?.hall_id
            },
            additionalServices
          } 
        });
    };

    const handleGoBack = () => {
        navigate(-1); // Go back to previous page
    };

    return (
        <div>
            <Navbar />
            <div className={styles.total}>
                {/* Left Section - Hall Details */}
                <div className={styles.halfpage}>
                    <div className={styles.details}>
                        <div className={styles.hallContainer}>
                            {/* Go Back Button */}
                            <button 
                                onClick={handleGoBack} 
                                className={styles.goBackButton || styles.phone}
                                style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '6px' }}
                            >
                                <FontAwesomeIcon icon={faArrowLeft} /> Go Back
                            </button>
                            
                            <div className={styles.mainImageContainer}>
                                <img 
                                    src={`http://localhost:8500/uploads/${mainImage}`} 
                                    className={styles.hallimg} 
                                    alt="Main Hall" 
                                />
                            </div>
                            <div className={styles.indetail}>
                                <h1>{hall.hall_name}</h1>
                                <p className={styles.location}>
                                    <FontAwesomeIcon icon={faLocationDot} className={styles.locationIcon} />
                                    {hall.location}, {hall.city}
                                </p>
                                <div className={styles.keyInfo}>
                                    <div className={styles.infoCard}>
                                        <span className={styles.infoLabel}>Price</span>
                                        <span className={styles.infoValue}>₹{hall.price}</span>
                                    </div>
                                    <div className={styles.infoCard}>
                                        <span className={styles.infoLabel}>Capacity</span>
                                        <span className={styles.infoValue}>{hall.capacity} people</span>
                                    </div>
                                    <div className={styles.infoCard}>
                                        <span className={styles.infoLabel}>Rating</span>
                                        <span className={styles.infoValue}>⭐ {hall.rating || '4.5'}/5</span>
                                    </div>
                                </div>
                                <a href="tel:+1234567890" className={styles.phone}>
                                    ☎️ Contact Venue
                                </a>
                            </div>

                            {/* Description Section */}
                            <div className={styles.description}>
                                <h2>About This Venue</h2>
                                <p>{hall.description || "This beautiful venue offers a perfect setting for your special events. With spacious accommodations and professional staff, we ensure your event is memorable. The hall features modern amenities, elegant decor, and is conveniently located."}</p>
                            </div>

                            {/* Services Section */}
                            <div className={styles.additionalDetails}>
                                <h2>Services Offered</h2>
                                <div className={styles.amenitiesList}>
                                    {Object.entries(hall.services || {}).map(([key, value]) => {
                                        if (value && key !== 'id' && !key.endsWith('Price') && !key.endsWith('Type')) {
                                            const displayName = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
                                            const priceKey = `${key}Price`;
                                            const price = hall.services[priceKey];
                                            
                                            return (
                                                <div className={styles.amenityItem} key={key}>
                                                    <span className={styles.amenityIcon}>
                                                        {getServiceIcon(key)}
                                                    </span>
                                                    <span className={styles.amenityName}>{displayName}</span>
                                                    <span className={styles.amenityPrice}>
                                                        {price ? `₹${price}` : 'Included'}
                                                    </span>
                                                </div>
                                            );
                                        }
                                        return null;
                                    })}
                                </div>
                            </div>

                            {/* Photos Section */}
                            <div className={styles.gallerySection}>
                                <h2>Gallery</h2>
                                <div className={styles.imageGallery}>
                                    {hall.images && hall.images.length > 0 ? hall.images.map((image, index) => (
                                        <div key={index} className={styles.galleryItem}>
                                            <a
                                                href="#"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setSelectedImage(image);
                                                    setMainImage(image);
                                                }}
                                            >
                                                <img 
                                                    src={`http://localhost:8500/uploads/${image}`} 
                                                    alt={`Hall ${index + 1}`} 
                                                    className={`${styles.smallImg} ${mainImage === image ? styles.activeImg : ''}`}
                                                />
                                            </a>
                                        </div>
                                    )) : <p>No images available</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Section - Booking Form */}
                <div className={styles.righthalf}>
                    <div className={styles.Booking}>
                        <form className={styles.bookingform} onSubmit={handleBooking}>
                            <h1>Book This Venue</h1>
                            
                            <div className={styles.formGroup}>
                                <label htmlFor="firstname">First Name: <span className={styles.required}>*</span></label>
                                <input
                                    type="text"
                                    id="firstname"
                                    name="firstname"
                                    value={formData.firstname}
                                    onChange={handleInputChange}
                                    required={isUserLoggedIn}  
                                    className={styles.formInput}
                                />
                            </div>
                            
                            <div className={styles.formGroup}>
                                <label htmlFor="lastname">Last Name: <span className={styles.required}>*</span></label>
                                <input
                                    type="text"
                                    id="lastname"
                                    name="lastname"
                                    value={formData.lastname}
                                    onChange={handleInputChange}
                                    required={isUserLoggedIn}  
                                    className={styles.formInput}
                                />
                            </div>
                            
                            <div className={styles.formGroup}>
                                <label htmlFor="email">Email: <span className={styles.required}>*</span></label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required={isUserLoggedIn}  
                                        disabled
                                        className={styles.formInput}
                                    />
                                    {!isUserLoggedIn && (
                                        <div className={styles.error || styles.loading} style={{ marginTop: '5px', backgroundColor: '#f8f5ff', borderLeft: '3px solid #7952b3' }}>
                                            Please log in to continue booking. Click "Book Now" to proceed to login.
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className={styles.formGroup}>
                                <label htmlFor="mobile">Mobile Number: <span className={styles.required}>*</span></label>
                                <input
                                    type="tel"
                                    id="mobile"
                                    name="mobile"
                                    value={formData.mobile}
                                    onChange={handleInputChange}
                                    required={isUserLoggedIn}  
                                    className={styles.formInput}
                                />
                            </div>
                            
                            <div className={styles.formGroup}>
                                <label htmlFor="alternate">Alternate Mobile Number:</label>
                                <input
                                    type="tel"
                                    id="alternate"
                                    name="alternate"
                                    value={formData.alternate}
                                    onChange={handleInputChange}
                                    className={styles.formInput}
                                />
                            </div>
                            
                            <div className={styles.formGroup}>
                                <label htmlFor="event_type">Type of Event: <span className={styles.required}>*</span></label>
                                <select
                                    id="event_type"
                                    name="event_type"
                                    value={formData.event_type}
                                    onChange={handleInputChange}
                                    required={isUserLoggedIn}  
                                    className={styles.formSelect}
                                >
                                    <option value="">Select Event Type</option>
                                    {eventTypes.map((type, index) => (
                                        <option key={index} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className={styles.formGroup}>
                                <label htmlFor="guests">Number of guests: <span className={styles.required}>*</span></label>
                                <input
                                    type="number"
                                    id="guests"
                                    name="guests"
                                    value={formData.guests}
                                    onChange={handleInputChange}
                                    required={isUserLoggedIn}  
                                    min="1"
                                    max={hall.capacity}
                                    placeholder={`Max ${hall.capacity} guests`}
                                    className={styles.formInput}
                                />
                            </div>
                            
                            <div className={styles.formGroup}>
                                <label htmlFor="date">
                                    Event date: <span className={styles.required}>*</span>
                                    <FontAwesomeIcon icon={faCalendarAlt} className={styles.calendarIcon} />
                                </label>
                                <DatePicker
                                    id="date"
                                    selected={selectedDate}
                                    onChange={handleDateChange}
                                    minDate={new Date()}
                                    filterDate={(date) => !isDateBooked(date)}
                                    dateFormat="MMMM d, yyyy"
                                    placeholderText="Select a date"
                                    required={isUserLoggedIn}  
                                    className={`${styles.formInput} ${styles.dateInput} ${dateError ? styles.errorInput : ""}`}
                                    dayClassName={(date) => 
                                        isDateBooked(date) ? styles.bookedDay : undefined
                                    }
                                />
                                {isLoading && <div className={styles.loading}>Checking availability...</div>}
                                {dateError && <div className={styles.error}>{dateError}</div>}
                            </div>
                            
                            {/* Additional Services Section */}
                            <div className={styles.amenitiesSelection}>
                                <h3>Additional Services</h3>
                                <div className={styles.servicesGrid}>
                                    {availableServices.map((service) => {
                                        // Only show the checkbox if the service is available in this hall
                                        const serviceKey = service.toLowerCase();
                                        if (hall.services && hall.services[serviceKey]) {
                                            return (
                                                <div className={styles.amenityOption} key={service}>
                                                    <input 
                                                        type="checkbox" 
                                                        id={service} 
                                                        name={service}
                                                        checked={selectedServices.includes(service)}
                                                        onChange={() => handleServiceChange(service)}
                                                    />
                                                    <label htmlFor={service} className={styles.serviceLabel}>
                                                        {getServiceIcon(service)} {service}
                                                        {hall.services[`${serviceKey}Price`] && 
                                                        <span className={styles.priceTag}>
                                                            ₹{hall.services[`${serviceKey}Price`]}
                                                        </span>}
                                                    </label>
                                                </div>
                                            );
                                        }
                                        return null;
                                    })}
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                <button 
                                    type="button" 
                                    onClick={handleGoBack}
                                    className={styles.goBackButton || styles.bookButton}
                                    style={{ 
                                        flex: '1', 
                                        backgroundColor: '#6c757d', 
                                        boxShadow: '0 4px 6px rgba(108, 117, 125, 0.25)' 
                                    }}
                                >
                                    Go Back
                                </button>
                                
                                <button 
                                    type="submit" 
                                    className={styles.bookButton}
                                    style={{ flex: '2' }}
                                    disabled={isLoading || dateError}
                                >
                                    {isLoading ? "Processing..." : (!isUserLoggedIn ? "Login to Book" : "Book Now")}
                                </button>
                            </div>
                            
                            <p className={styles.requiredNote}><span className={styles.required}>*</span> Required fields</p>
                            {error && <div className={styles.error}>{error}</div>}
                        </form>
                    </div>
                </div>
            </div>

            {/* Image Modal */}
            {selectedImage && (
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <span className={styles.close} onClick={() => setSelectedImage(null)}>
                            <FontAwesomeIcon icon={faTimes} />
                        </span>
                        <img 
                            src={`http://localhost:8500/uploads/${selectedImage}`} 
                            alt="Enlarged Hall" 
                            className={styles.largeImg} 
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default HomeDetails;