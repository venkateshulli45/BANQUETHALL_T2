import React, { useState, useEffect } from "react";
import { FaUser, FaCalendarCheck, FaHeadset, FaBars, FaSignOutAlt, FaArrowLeft, FaBell } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { jwtDecode } from "jwt-decode";
import ProfileSection from "./ProfileSection";
import BookingsSection from "./BookingsSection";
import NotificationsSection from "./NotificationsSection";
import SupportSection from "./SupportSection";
import "./UserDashboard.css";

const UserDashboard = () => {
  const [activeSection, setActiveSection] = useState("Profile");
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [user, setUser] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [cookies] = useCookies(["authToken"]);
  const navigate = useNavigate();
  const [expandedBooking, setExpandedBooking] = useState(null);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userEmail = jwtDecode(cookies.authToken).email;
        if (!userEmail) {
          setMessage("User not logged in!");
          setIsError(true);
          window.location.href = "/UserLogin";
          return;
        }

        try {
          const userResponse = await axios.get(`http://localhost:8500/api/user1/${userEmail}`);
          setUser(userResponse.data);
          setEditFormData(userResponse.data);

          // Fetch bookings
          const bookingResponse = await axios.get(`http://localhost:8500/api/user/bookings/${userEmail}`);
          setBookings(bookingResponse.data.bookings || []);

          // Fetch notifications
          const notificationResponse = await axios.get(`http://localhost:8500/api/user/notifications/${userEmail}`);
          setNotifications(notificationResponse.data.notifications || []);
        } catch (error) {
          console.error("Error fetching user data:", error);
          setMessage("Failed to fetch data. Please try again.");
          setIsError(true);
          setBookings([]);
          setNotifications([]);
          clearMessageAfterDelay();
        }
      } catch (error) {
        console.error("JWT decode error:", error);
        setMessage("Authentication error. Please login again.");
        setIsError(true);
        window.location.href = "/UserLogin";
      }
    };

    fetchUserData();
  }, [cookies.authToken]);

  const handleLogout = async () => {
    await fetch("http://localhost:8500/api/logout", {
      method: "POST",
      credentials: "include",
    });
    window.location.href = "/userLogin";
  };

  const handleBackToHome = () => {
    navigate("/");
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setMessage("");
    setIsError(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({ ...editFormData, [name]: value });
  };

  const handleSaveChanges = async () => {
    try {
      const userEmail = jwtDecode(cookies.authToken).email;
      if (!userEmail) {
        setMessage("User email not found.");
        setIsError(true);
        return;
      }

      const response = await axios.put(`http://localhost:8500/api/user1/${userEmail}`, editFormData);
      if (response.status === 200) {
        setMessage("Profile updated successfully!");
        setIsError(false);
        setUser(editFormData);
        setIsEditing(false);
        clearMessageAfterDelay();
      }
    } catch (error) {
      console.error("Error updating user details:", error);
      setMessage("Failed to update profile. Please try again.");
      setIsError(true);
      clearMessageAfterDelay();
    }
  };

  const handleBookingClick = (bookingId) => {
    setExpandedBooking(expandedBooking === bookingId ? null : bookingId);
  };

  const clearMessageAfterDelay = () => {
    setTimeout(() => {
      setMessage("");
      setIsError(false);
    }, 3000);
  };

  return (
    <div className="dashboard-wrapper">
      <header className="navbar">
        <div className="navbar-left">
          <FaArrowLeft className="back-arrow" onClick={handleBackToHome} />
          <FaBars className="menu-icon" onClick={() => setSidebarOpen(!sidebarOpen)} />
        </div>
        <h2 className="navbar-title">Event Heaven</h2>
        <span className="user-name">Welcome, {user.username}</span>
      </header>

      <nav className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <ul className="sidebar-ul">
          {[
            { name: "Profile", icon: <FaUser /> },
            { name: "Bookings", icon: <FaCalendarCheck /> },
            { name: "Notifications", icon: <FaBell /> },
            { name: "Support", icon: <FaHeadset /> },
          ].map((item) => (
            <li
              key={item.name}
              className={`sidebar-li ${activeSection === item.name ? "active" : ""}`}
              onClick={() => setActiveSection(item.name)}
            >
              {item.icon}
              {sidebarOpen && <span className="sidebar-span">{item.name}</span>}
            </li>
          ))}
        </ul>
      </nav>

      <div className={`main-content ${sidebarOpen ? "open" : "closed"}`}>
        {activeSection === "Profile" && (
          <ProfileSection
            user={user}
            isEditing={isEditing}
            editFormData={editFormData}
            handleInputChange={handleInputChange}
            handleEditToggle={handleEditToggle}
            handleSaveChanges={handleSaveChanges}
            message={message}
            isError={isError}
          />
        )}

        {activeSection === "Bookings" && (
          <BookingsSection
            bookings={bookings}
            expandedBooking={expandedBooking}
            handleBookingClick={handleBookingClick}
          />
        )}

        {activeSection === "Notifications" && (
          <NotificationsSection notifications={notifications} />
        )}

        {activeSection === "Support" && <SupportSection />}
      </div>
    </div>
  );
};

export default UserDashboard;