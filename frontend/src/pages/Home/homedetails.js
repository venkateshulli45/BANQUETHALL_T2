import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./homedetails.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot, faTimes, faCalendarAlt, faUtensils, faCamera, faMusic, faPaintBrush, faArrowLeft, faRobot } from "@fortawesome/free-solid-svg-icons";
import Navbar from "./Navbar";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import { useCookies } from "react-cookie";
import { jwtDecode } from "jwt-decode";

const ChatbotBooking = ({
    formData,
    handleInputChange,
    selectedDate,
    handleDateChange,
    selectedServices = [],
    handleServiceChange,
    eventTypes,
    availableServices,
    hall,
    handleBooking,
    isUserLoggedIn,
    isLoading,
    dateError,
    isDateBooked,
    setUseChatbot
}) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [chatMessages, setChatMessages] = useState([
        { sender: 'bot', content: "Hello! I'll help you book this venue. What's your first name?" }
    ]);
    const [userInput, setUserInput] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showServiceSelection, setShowServiceSelection] = useState(false);
    const [showEventTypeSelection, setShowEventTypeSelection] = useState(false);
    const [validationError, setValidationError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [localDateError, setLocalDateError] = useState('');
    const [localSelectedServices, setLocalSelectedServices] = useState([]);

    useEffect(() => {
        if (Array.isArray(selectedServices)) {
            setLocalSelectedServices(selectedServices.filter(service => typeof service === 'string'));
        }
    }, [selectedServices]);

    const steps = [
        {
            field: 'firstname',
            question: "What's your first name?",
            type: 'text',
            validate: (value) => {
                if (!value.trim()) return "First name is required";
                if (value.length < 2) return "First name must be at least 2 characters";
                if (!/^[a-zA-Z]+$/.test(value)) return "First name should contain only letters";
                return null;
            }
        },
        {
            field: 'lastname',
            question: "What's your last name?",
            type: 'text',
            validate: (value) => {
                if (!value.trim()) return "Last name is required";
                if (value.length < 2) return "Last name must be at least 2 characters";
                if (!/^[a-zA-Z]+$/.test(value)) return "Last name should contain only letters";
                return null;
            }
        },
        {
            field: 'mobile',
            question: "What's your mobile number?",
            type: 'tel',
            validate: (value) => {
                if (!value.trim()) return "Mobile number is required";
                if (!/^\d{10}$/.test(value)) return "Please enter a valid 10-digit mobile number";
                return null;
            }
        },
        {
            field: 'event_type',
            question: "What type of event is this?",
            type: 'select',
            options: eventTypes,
            validate: (value) => {
                if (!value.trim()) return "Event type is required";
                if (!eventTypes.includes(value)) return "Please select a valid event type";
                return null;
            }
        },
        {
            field: 'guests',
            question: `How many guests will be attending? (Max ${hall.capacity})`,
            type: 'number',
            validate: (value) => {
                const num = parseInt(value);
                if (!value || isNaN(num)) return "Please enter a valid number";
                if (num < 1) return "Must have at least 1 guest";
                if (num > hall.capacity) return `Maximum capacity is ${hall.capacity} guests`;
                return null;
            }
        },
        {
            field: 'date',
            question: "When is your event?",
            type: 'date',
            validate: (date) => {
                if (!date) return "Event date is required";
                if (isDateBooked(date)) return "This date is already booked";
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                if (date < today) return "Please select a future date";
                return null;
            }
        },
        {
            field: 'services',
            question: "Would you like any additional services? (Select all that apply)",
            type: 'services'
        },
        {
            field: 'confirm',
            question: "Ready to book? (Please reply with 'yes' or 'confirm')",
            type: 'confirm',
            validate: (value) => {
                const normalized = value.toLowerCase().trim();
                if (!['yes', 'confirm', 'y'].includes(normalized)) {
                    return "Please reply with 'yes' or 'confirm' to proceed";
                }
                return null;
            }
        }
    ];

    const validateInput = (value) => {
        const current = steps[currentStep];
        return current.validate ? current.validate(value) : null;
    };

    useEffect(() => {
        if (steps[currentStep].field === 'event_type') {
            setShowEventTypeSelection(true);
            setUserInput('');
        } else if (steps[currentStep].field === 'services') {
            setShowServiceSelection(true);
            setUserInput('');
        }
    }, [currentStep]);

    const proceedToNext = () => {
        const nextStep = currentStep + 1;
        if (nextStep < steps.length) {
            setCurrentStep(nextStep);
            setChatMessages(prev => [...prev, { sender: 'bot', content: steps[nextStep].question }]);
        }
    };

    const handleSendMessage = () => {
        if (isProcessing) return;
        setIsProcessing(true);

        const currentStepData = steps[currentStep];
        const error = validateInput(userInput);

        if (error) {
            setValidationError(error);
            setIsProcessing(false);
            return;
        }

        setChatMessages(prev => [...prev, { sender: 'user', content: userInput }]);

        if (currentStepData.field !== 'services' && currentStepData.field !== 'confirm') {
            const value = currentStepData.field === 'guests' ? parseInt(userInput) : userInput;
            handleInputChange({ 
                target: { 
                    name: currentStepData.field, 
                    value: value 
                } 
            });
        }

        switch (currentStepData.field) {
            case 'date':
                setShowDatePicker(true);
                setUserInput('');
                break;
            
            case 'services':
                setShowServiceSelection(true);
                setUserInput('');
                break;
            
            case 'confirm':
                const normalized = userInput.toLowerCase().trim();
                if (['yes', 'confirm', 'y'].includes(normalized)) {
                    handleBooking({ preventDefault: () => {} });
                }
                break;
            
            default:
                proceedToNext();
                break;
        }

        setUserInput('');
        setIsProcessing(false);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    const handleDateSelection = (date) => {
        const error = steps[currentStep].validate(date);
        if (error) {
            setLocalDateError(error);
            return;
        }

        setLocalDateError('');
        handleDateChange(date);
        
        const formattedDate = typeof format === 'function' 
            ? format(date, 'MMMM d, yyyy') 
            : date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        
        setChatMessages(prev => [
            ...prev,
            { sender: 'user', content: formattedDate }
        ]);
        
        setShowDatePicker(false);
        
        setTimeout(() => {
            setChatMessages(prev => [...prev, { sender: 'bot', content: steps[currentStep + 1].question }]);
            setCurrentStep(currentStep + 1);
        }, 300);
    };

    const handleServiceToggle = (service) => {
        setLocalSelectedServices(prev => {
            const newServices = prev.includes(service)
                ? prev.filter(s => s !== service)
                : [...prev, service];
            
            handleServiceChange({
                target: {
                    name: 'services',
                    value: newServices
                }
            });
            
            return newServices;
        });
    };

    const confirmServices = () => {
        setShowServiceSelection(false);
        
        setChatMessages(prev => [
            ...prev,
            { 
                sender: 'user', 
                content: localSelectedServices.length > 0 
                    ? `Selected services: ${localSelectedServices.join(', ')}` 
                    : 'No additional services needed' 
            }
        ]);
        
        setTimeout(() => {
            setChatMessages(prev => [
                ...prev,
                { sender: 'bot', content: steps[currentStep + 1].question }
            ]);
            setCurrentStep(currentStep + 1);
        }, 500);
    };

    const handleEventTypeSelect = (type) => {
        handleInputChange({ 
            target: { 
                name: 'event_type', 
                value: type 
            } 
        });
        
        setChatMessages(prev => [
            ...prev,
            { sender: 'user', content: type }
        ]);
        
        setShowEventTypeSelection(false);
        
        setTimeout(() => {
            setChatMessages(prev => [...prev, { sender: 'bot', content: steps[currentStep + 1].question }]);
            setCurrentStep(currentStep + 1);
        }, 300);
    };

    const shouldShowDatePickerButton = (msg, index) => {
        return msg.sender === 'bot' && 
               steps[currentStep]?.field === 'date' && 
               index === chatMessages.length - 1;
    };

    const getServiceIcon = (service) => {
        switch(service.toLowerCase()) {
            case 'catering': return <FontAwesomeIcon icon={faUtensils} />;
            case 'photography': return <FontAwesomeIcon icon={faCamera} />;
            case 'decoration': return <FontAwesomeIcon icon={faPaintBrush} />;
            case 'music': return <FontAwesomeIcon icon={faMusic} />;
            case 'djorchestras': 
            case "d'orchestras": 
                return <FontAwesomeIcon icon={faMusic} />;
            case 'makeup': return <FontAwesomeIcon icon={faPaintBrush} />;
            default: return null;
        }
    };

    return (
        <div className={styles.chatbotContainer}>
            <div className={styles.chatHeader}>
                <h3>Booking Assistant</h3>
                <button 
                    onClick={() => setUseChatbot(false)} 
                    className={styles.switchButton}
                >
                    Switch to Form
                </button>
            </div>

            <div className={styles.chatMessages}>
                {chatMessages.map((msg, index) => (
                    <div 
                        key={index} 
                        className={`${styles.message} ${msg.sender === 'bot' ? styles.botMessage : styles.userMessage}`}
                    >
                        {msg.sender === 'bot' && <div className={styles.botAvatar}>🤖</div>}
                        <div className={styles.messageContent}>
                            {msg.content}
                            {shouldShowDatePickerButton(msg, index) && (
                                <button 
                                    onClick={() => {
                                        setShowDatePicker(true);
                                        setUserInput('');
                                    }}
                                    className={styles.chatButton}
                                >
                                    <FontAwesomeIcon icon={faCalendarAlt} /> Pick Date
                                </button>
                            )}
                        </div>
                    </div>
                ))}

                {showDatePicker && (
                    <div className={styles.chatDatePicker}>
                        <DatePicker
                            selected={selectedDate || new Date()}
                            onChange={handleDateSelection}
                            minDate={new Date()}
                            filterDate={(date) => !isDateBooked(date)}
                            inline
                            showMonthDropdown
                            showYearDropdown
                            dropdownMode="select"
                        />
                        {localDateError && <div className={styles.error}>{localDateError}</div>}
                    </div>
                )}

                {showEventTypeSelection && (
                    <div className={styles.chatEventTypes}>
                        <h4>Select Event Type</h4>
                        <div className={styles.eventTypeOptions}>
                            {eventTypes.map((type) => (
                                <button
                                    key={type}
                                    className={styles.eventTypeButton}
                                    onClick={() => handleEventTypeSelect(type)}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

{showServiceSelection && (
                <div className={styles.chatServices}>
                    <h4>Available Services</h4>
                    <div className={styles.serviceOptions}>
                        {availableServices.map((service) => {
                            // Convert display name back to service key for lookup
                            const serviceKey = service === "D'Orchestras" ? 'djOrchestras' : 
                                             service.toLowerCase();
                            
                            if (hall.services?.[serviceKey]) {
                                return (
                                    <div key={service} className={styles.serviceOption}>
                                        <input
                                            type="checkbox"
                                            id={`service-${service}`}
                                            checked={localSelectedServices.includes(service)}
                                            onChange={() => handleServiceToggle(service)}
                                            className={styles.serviceCheckbox}
                                        />
                                        <label 
                                            htmlFor={`service-${service}`} 
                                            className={styles.serviceLabel}
                                        >
                                            <span className={styles.serviceIcon}>
                                                {getServiceIcon(serviceKey)}
                                            </span>
                                            <span className={styles.serviceText}>
                                                {service}
                                                {hall.services[`${serviceKey}Price`] && (
                                                    <span className={styles.servicePrice}>
                                                        (₹{hall.services[`${serviceKey}Price`]})
                                                    </span>
                                                )}
                                            </span>
                                        </label>
                                    </div>
                                );
                            }
                            return null;
                        })}
                    </div>
                    <button 
                        onClick={confirmServices}
                        className={styles.confirmButton}
                    >
                        Confirm Services
                    </button>
                </div>
            )}
            </div>

            {!showDatePicker && !showServiceSelection && !showEventTypeSelection && currentStep < steps.length && (
                <div className={styles.chatInputContainer}>
                    {validationError && <div className={styles.error}>{validationError}</div>}
                    <div className={styles.chatInput}>
                        <input
                            type={steps[currentStep].type === 'number' ? 'number' : 'text'}
                            value={userInput}
                            onChange={(e) => {
                                setUserInput(e.target.value);
                                setValidationError('');
                            }}
                            onKeyPress={handleKeyPress}
                            placeholder={
                                steps[currentStep].type === 'select' 
                                    ? `Select from: ${steps[currentStep].options.join(', ')}` 
                                    : steps[currentStep].type === 'confirm'
                                    ? "Type 'yes' or 'confirm'"
                                    : `Enter your ${steps[currentStep].field.replace('_', ' ')}`
                            }
                            min={steps[currentStep].type === 'number' ? '1' : undefined}
                            max={steps[currentStep].field === 'guests' ? hall.capacity : undefined}
                            disabled={isProcessing}
                        />
                        <button
                            onClick={handleSendMessage}
                            disabled={(!userInput.trim() && steps[currentStep].type !== 'select') || isProcessing}
                        >
                            {isProcessing ? 'Sending...' : 'Send'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const HomeDetails = () => {
    const location = useLocation();
    const [cookies] = useCookies(['authToken']);
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
    const [useChatbot, setUseChatbot] = useState(false);
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

    // Get all available services from hall data
    const availableServices = Object.entries(hall.services || {})
    .filter(([key, value]) => 
        value && 
        typeof value === 'boolean' && 
        value === true && 
        !key.endsWith('Type') && 
        key !== 'id'
    )
    .map(([key]) => {
        // Handle special case for 'djOrchestras' to show as "D'Orchestras"
        if (key === 'djOrchestras') {
            return "D'Orchestras";
        }
        return key.charAt(0).toUpperCase() + key.slice(1);
    });
    
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

    const handleServiceChange = (e) => {
        const services = Array.isArray(e.target.value) 
            ? e.target.value.filter(service => typeof service === 'string')
            : [];
        setSelectedServices(services);
    };

    const getServiceIcon = (service) => {
        switch(service.toLowerCase()) {
            case 'catering': return <FontAwesomeIcon icon={faUtensils} />;
            case 'photography': return <FontAwesomeIcon icon={faCamera} />;
            case 'decoration': return <FontAwesomeIcon icon={faPaintBrush} />;
            case 'music': return <FontAwesomeIcon icon={faMusic} />;
            case 'djorchestras': return <FontAwesomeIcon icon={faMusic} />;
            case 'makeup': return <FontAwesomeIcon icon={faPaintBrush} />;
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
      
        let totalPrice = parseFloat(hall.price);
        let additionalServices = {};
        
        const validServices = Array.isArray(selectedServices) 
            ? selectedServices.filter(service => typeof service === 'string')
            : [];
        
        if (validServices.length > 0) {
            validServices.forEach(service => {
                const serviceKey = service.toLowerCase();
                if (serviceKey === 'catering' && hall.services.cateringPrice) {
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
                selectedServices: validServices,
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
        navigate(-1);
    };

    return (
        <div>
            <Navbar />
            <div className={styles.total}>
                <div className={styles.halfpage}>
                    <div className={styles.details}>
                        <div className={styles.hallContainer}>
                            <button 
                                onClick={handleGoBack} 
                                className={styles.goBackButton}
                            >
                                <FontAwesomeIcon icon={faArrowLeft} /> Back
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

                            <div className={styles.description}>
                                <h2>About This Venue</h2>
                                <p>{hall.description || "This beautiful venue offers a perfect setting for your special events. With spacious accommodations and professional staff, we ensure your event is memorable. The hall features modern amenities, elegant decor, and is conveniently located."}</p>
                            </div>

                            <div className={styles.additionalDetails}>
                                <h2>Services Offered</h2>
                                <div className={styles.amenitiesList}>
                                    {Object.entries(hall.services || {}).map(([key, value]) => {
                                        if (value && typeof value === 'boolean' && value === true && !key.endsWith('Type') && key !== 'id') {
                                            const displayName = key === 'djOrchestras' ? "D'Orchestras" : 
                                                key.charAt(0).toUpperCase() + key.slice(1);
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

                <div className={styles.righthalf}>
                    <button 
                        onClick={() => setUseChatbot(!useChatbot)}
                        className={styles.chatbotToggle}
                        title={useChatbot ? "Switch to form" : "Use chatbot"}
                    >
                        <FontAwesomeIcon icon={faRobot} />
                    </button>
                    
                    <div className={styles.Booking}>
                        {useChatbot ? (
                            <ChatbotBooking
                                formData={formData}
                                handleInputChange={handleInputChange}
                                selectedDate={selectedDate}
                                handleDateChange={handleDateChange}
                                selectedServices={selectedServices}
                                handleServiceChange={handleServiceChange}
                                eventTypes={eventTypes}
                                availableServices={availableServices}
                                hall={hall}
                                handleBooking={handleBooking}
                                isUserLoggedIn={isUserLoggedIn}
                                isLoading={isLoading}
                                dateError={dateError}
                                isDateBooked={isDateBooked}
                                setUseChatbot={setUseChatbot}
                            />
                        ) : (
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
                                        required
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
                                        required
                                        className={styles.formInput}
                                    />
                                </div>
                                
                                <div className={styles.formGroup}>
                                    <label htmlFor="email">Email: <span className={styles.required}>*</span></label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                        disabled={isUserLoggedIn}
                                        className={styles.formInput}
                                    />
                                </div>
                                
                                <div className={styles.formGroup}>
                                    <label htmlFor="mobile">Mobile Number: <span className={styles.required}>*</span></label>
                                    <input
                                        type="tel"
                                        id="mobile"
                                        name="mobile"
                                        value={formData.mobile}
                                        onChange={handleInputChange}
                                        required
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
                                        required
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
                                        required
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
                                        required
                                        className={`${styles.formInput} ${styles.dateInput} ${dateError ? styles.errorInput : ""}`}
                                        dayClassName={(date) => 
                                            isDateBooked(date) ? styles.bookedDay : undefined
                                        }
                                    />
                                    {isLoading && <div className={styles.loading}>Checking availability...</div>}
                                    {dateError && <div className={styles.error}>{dateError}</div>}
                                </div>
                                
                                <div className={styles.amenitiesSelection}>
                                    <h3>Additional Services</h3>
                                    <div className={styles.servicesGrid}>
                                        {availableServices.map((service) => {
                                            // Convert back to the original key format for price lookup
                                            const serviceKey = service === "D'Orchestras" ? 'djOrchestras' : 
                                                service.toLowerCase();
                                            
                                            if (hall.services && hall.services[serviceKey]) {
                                                return (
                                                    <div className={styles.amenityOption} key={service}>
                                                        <input 
                                                            type="checkbox" 
                                                            id={service} 
                                                            name={service}
                                                            checked={selectedServices.includes(service)}
                                                            onChange={() => handleServiceChange({
                                                                target: {
                                                                    name: 'services',
                                                                    value: selectedServices.includes(service)
                                                                        ? selectedServices.filter(s => s !== service)
                                                                        : [...selectedServices, service]
                                                                }
                                                            })}
                                                        />
                                                        <label htmlFor={service} className={styles.serviceLabel}>
                                                            {getServiceIcon(serviceKey)} {service}
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
                                
                                <div className={styles.formActions}>
                                    <button 
                                        type="button" 
                                        onClick={handleGoBack}
                                        className={styles.formBackButton}
                                    >
                                        <FontAwesomeIcon icon={faArrowLeft} /> Back
                                    </button>
                                    
                                    <button 
                                        type="submit" 
                                        className={styles.bookButton}
                                        disabled={isLoading || dateError}
                                    >
                                        {isLoading ? "Processing..." : (!isUserLoggedIn ? "Login to Book" : "Book Now")}
                                    </button>
                                </div>
                                
                                <p className={styles.requiredNote}><span className={styles.required}>*</span> Required fields</p>
                                {error && <div className={styles.error}>{error}</div>}
                            </form>
                        )}
                    </div>
                </div>
            </div>

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