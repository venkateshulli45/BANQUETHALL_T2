import React, { useState, useEffect } from "react";
import { FaUser, FaMoneyBill, FaCalendarCheck, FaHeadset, FaBars, FaSignOutAlt, FaArrowLeft, FaEdit } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { jwtDecode } from "jwt-decode";
import { FaChevronUp, FaChevronDown } from "react-icons/fa"; 

// Updated inline styles with light theme colors
const styles = {
  dashboardWrapper: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    overflow: "hidden",
    backgroundColor: "#fff1f5",
    color: "#333",
  },
  navbar: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "linear-gradient(135deg, #ff4081 0%, #e91e63 100%)",
    color: "#fff",
    padding: "10px 20px",
    height: "60px",
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
  },
  navbarLeft: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  backArrow: {
    fontSize: "20px",
    cursor: "pointer",
    color: "#fff",
    marginRight: "15px",
  },
  menuIcon: {
    fontSize: "24px",
    cursor: "pointer",
    color: "#fff",
    marginRight: "15px",
  },
  navbarTitle: {
    fontSize: "24px",
    color: "#fff",
    margin: 0,
  },
  userName: {
    fontSize: "18px",
    color: "#fff",
    maxWidth: "180px",
    marginRight: "20px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  sidebar: {
    position: "fixed",
    top: "60px",
    left: 0,
    height: "calc(100vh - 60px)",
    background: "linear-gradient(180deg, #e91e63 0%, #ff4081 100%)",
    color: "#fff",
    overflowY: "auto",
    transition: "width 0.3s ease",
    zIndex: 999,
    scrollbarWidth: "none",
    msOverflowStyle: "none",
  },
  sidebarOpen: {
    width: "200px",
  },
  sidebarClosed: {
    width: "70px",
  },
  sidebarUl: {
    listStyle: "none",
    padding: 0,
    margin: "20px 0 0 0",
  },
  sidebarLi: {
    padding: "15px 20px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    transition: "background-color 0.3s ease",
  },
  sidebarLiHover: {
    backgroundColor: "#d81b60",
  },
  sidebarSpan: {
    marginLeft: "10px",
    fontSize: "16px",
  },
  mainContent: (sidebarOpen) => ({
    marginLeft: sidebarOpen ? "200px" : "70px",
    padding: "80px 20px 20px",
    flexGrow: 1,
    transition: "margin-left 0.3s ease",
    backgroundColor: "#f8f9fa",
    minHeight: "calc(100vh - 60px)",
    overflowY: "auto",
    scrollbarWidth: "none",
    msOverflowStyle: "none",
  }),
  
  

  dashboardContainer: {
    padding: "20px",
    borderRadius: "8px",
  },
  profileContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  profileCard: {
    padding: "30px",
    borderRadius: "8px",
    backgroundColor: "#ffffff", // --card-bg
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)", // --shadow-color
    textAlign: "center",
    width: "100%",
    maxWidth: "450px",
  },
  profileTitle: {
    color: "#e91e63", // --accent-color
    marginBottom: "20px",
    fontSize: "24px",
  },
  profileIcon: {
    fontSize: "70px",
    color: "#e91e63", // --accent-color
    marginBottom: "15px",
    display: "flex",
    justifyContent: "center",
  },
  profileDetails: {
    marginTop: "20px",
    color: "#333", // --text-color
  },
  profileDetailItem: {
    margin: "10px 0",
    fontSize: "16px",
    display: "flex",
    justifyContent: "space-between",
    padding: "8px 0",
    borderBottom: "1px solid #e0e0e0", // --border-color
  },
  profileActions: {
    display: "flex",
    justifyContent: "space-between",
    width: "100%",
    maxWidth: "400px",
    marginTop: "30px",
  },
  editBtn: {
    backgroundColor: "#e91e63", // --accent-color
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "5px",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  logoutBtn: {
    backgroundColor: "#f5f5f5", // --cancel-bg
    color: "#666666", // --cancel-text
    border: "1px solid #dddddd", // --cancel-border
    padding: "10px 20px",
    borderRadius: "5px",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  editForm: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    width: "100%",
  },
  inputField: {
    padding: "12px",
    border: "1px solid #eeeeee", // --input-border
    borderRadius: "5px",
    width: "100%",
    backgroundColor: "#ffffff", // --input-bg
    color: "#333", // --text-color
  },
  editActions: {
    display: "flex",
    gap: "15px",
    marginTop: "25px",
    justifyContent: "center",
  },
  saveBtn: {
    backgroundColor: "#e91e63", // --accent-color
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "5px",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
  cancelBtn: {
    backgroundColor: "#f5f5f5", // --cancel-bg
    color: "#666666", // --cancel-text
    border: "1px solid #dddddd", // --cancel-border
    padding: "10px 20px",
    borderRadius: "5px",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
  message: {
    marginTop: "15px",
    fontSize: "14px",
    color: "#28a745",
    padding: "8px",
    borderRadius: "4px",
    backgroundColor: "rgba(40, 167, 69, 0.1)",
  },
  errorMessage: {
    color: "#dc3545",
    backgroundColor: "rgba(220, 53, 69, 0.1)",
  },
  supportContainer: {
    padding: "30px",
    borderRadius: "8px",
    backgroundColor: "#ffffff", // --card-bg
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)", // --shadow-color
    maxWidth: "600px",
    margin: "0 auto",
  },
  supportTitle: {
    color: "#e91e63", // --accent-color
    marginBottom: "20px",
    fontSize: "24px",
  },
  supportText: {
    marginBottom: "15px",
    fontSize: "16px",
    color: "#333", // --text-color
  },
  supportEmail: {
    color: "#e91e63", // --accent-color
    textDecoration: "none",
    fontWeight: "bold",
    fontSize: "18px",
  },
  paymentsContainer: {
    padding: "30px",
    borderRadius: "8px",
    backgroundColor: "#ffffff", // --card-bg
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)", // --shadow-color
  },
  paymentsTitle: {
    color: "#e91e63", // --accent-color
    marginBottom: "20px",
    fontSize: "24px",
  },
  dataTable: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "20px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
    borderRadius: "8px",
    overflow: "hidden",
  },
  tableHead: {
    backgroundColor: "#e91e63", // --accent-color
    color: "#fff",
  },
  tableHeader: {
    padding: "12px 15px",
    textAlign: "left",
    fontSize: "14px",
    fontWeight: "600",
  },
  tableRow: {
    borderBottom: "1px solid #e0e0e0", // --border-color
  },
  tableCell: {
    padding: "12px 15px",
    color: "#333", // --text-color
    fontSize: "14px",
  },
  tableCellAlt: {
    backgroundColor: "#f8f9fa", // --content-bg
  },
  statusPaid: {
    color: "#28a745",
    fontWeight: "600",
  },
  statusPending: {
    color: "#ffc107",
    fontWeight: "600",
  },
  statusConfirmed: {
    color: "#28a745",
    fontWeight: "600",
  },
  bookingsContainer: {
    padding: "30px",
    borderRadius: "8px",
    backgroundColor: "#ffffff", // --card-bg
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)", // --shadow-color
  },
  bookingsTitle: {
    color: "#e91e63", // --accent-color
    marginBottom: "20px",
    fontSize: "24px",
  },
  emptyMessage: {
    textAlign: "center",
    padding: "20px",
    color: "#666666", // --text-secondary
    fontStyle: "italic",
  },
  // Media queries can be handled through inline style adjustments
   // Add these new styles
   bookingCard: {
    background: "#ffffff", // --card-bg
    color: "#333", // --text-color
    borderRadius: "12px",
    padding: "1.5rem",
    marginBottom: "1rem",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)", // --shadow-color
    transition: "all 0.3s ease",
    borderLeft: "4px solid #e91e63", // --accent-color
  },
  bookingCardHover: {
    transform: "translateX(5px)",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
  },
  bookingHeader: {
    display: "flex",
    gap: "1rem",
    alignItems: "flex-start",
    cursor: "pointer",
  },
  bookingIcon: {
    background: "rgba(233, 30, 99, 0.1)", // accent color with opacity
    color: "#e91e63", // --accent-color
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  bookingContent: {
    flex: 1,
  },
  bookingTitle: {
    color: "#e91e63", // --accent-color
    margin: "0 0 0.5rem 0",
    fontSize: "1.1rem",
  },
  bookingText: {
    color: "#666", // --text-secondary
    margin: "0.5rem 0",
    lineHeight: 1.5,
  },
  expandIcon: {
    width: "24px",
    height: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  bookingDetails: {
    marginTop: "1.5rem",
    paddingTop: "1.5rem",
    borderTop: "1px dashed #ddd", // --border-color
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  detailItem: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.5rem",
  },
  detailLabel: {
    fontWeight: 600,
    color: "#333", // --text-color
    minWidth: "140px",
  },
  detailValue: {
    color: "#666", // --text-secondary
    flex: 1,
  },
  additionalServices: {
    marginTop: "1rem",
  },
  servicesTitle: {
    color: "#e91e63", // --accent-color
    margin: "0 0 0.75rem 0",
    fontSize: "1rem",
  },
  servicesList: {
    background: "#f8f9fa", // --content-bg
    borderRadius: "8px",
    padding: "1rem",
  },
  serviceItem: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "0.5rem",
    paddingBottom: "0.5rem",
    borderBottom: "1px dotted #ddd", // --border-color
  },
  serviceName: {
    fontWeight: 500,
    color: "#333", // --text-color
  },
  servicePrice: {
    color: "#e91e63", // --accent-color
    fontWeight: 600,
  },
  statusBadge: (status) => ({
    padding: "0.25rem 0.5rem",
    borderRadius: "20px",
    fontSize: "0.8rem",
    fontWeight: 600,
    background: status === "confirmed" ? "rgba(40, 167, 69, 0.1)" : "rgba(255, 193, 7, 0.1)",
    color: status === "confirmed" ? "#28a745" : "#ffc107",
  }),

};

const UserDashboard = () => {
  const [activeSection, setActiveSection] = useState("Profile");
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768); // Default closed on mobile
  const [user, setUser] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [payments, setPayments] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [cookies] = useCookies(["authToken", "vendorToken"]);
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
    handleResize(); // Initialize on first load

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
          console.log("User Bookings API Response:", bookingResponse.data);
          setBookings(bookingResponse.data.bookings || []);

          // Fetch payments
          const paymentResponse = await axios.get(`http://localhost:8500/api/payments/${userEmail}`);
          setPayments(Array.isArray(paymentResponse.data.payments) ? paymentResponse.data.payments : []);
        } catch (error) {
          console.error("Error fetching user details, bookings, or payments:", error);
          setMessage("Failed to fetch data. Please try again.");
          setIsError(true);
          setPayments([]);
          setBookings([]);
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

  const clearMessageAfterDelay = () => {
    setTimeout(() => {
      setMessage("");
      setIsError(false);
    }, 3000);
  };

  const getTableRowClass = (index) => {
    return index % 2 === 0 ? { ...styles.tableRow } : { ...styles.tableRow, ...styles.tableCellAlt };
  };

  const handleBookingClick = (bookingId) => {
    if (expandedBooking === bookingId) {
      setExpandedBooking(null);
    } else {
      setExpandedBooking(bookingId);
    }
  };
  // Handle hover effect for sidebar items
  const [hoveredItem, setHoveredItem] = useState(null);

  console.log(bookings)
  return (
    <div style={styles.dashboardWrapper}>
      <header style={styles.navbar}>
        <div style={styles.navbarLeft}>
          <FaArrowLeft
            style={styles.backArrow}
            onClick={handleBackToHome}
          />
          <FaBars
            style={styles.menuIcon}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          />
        </div>
        <h2 style={styles.navbarTitle}>Event Heaven</h2>
        <span style={styles.userName}>Welcome, {user.username}</span>
      </header>

      <nav style={{ ...styles.sidebar, ...(sidebarOpen ? styles.sidebarOpen : styles.sidebarClosed) }}>
        <ul style={styles.sidebarUl}>
          {[
            { name: "Profile", icon: <FaUser /> },
            { name: "Bookings", icon: <FaCalendarCheck /> },
            { name: "Payments", icon: <FaMoneyBill /> },
            { name: "Support", icon: <FaHeadset /> },
          ].map((item) => (
            <li
              key={item.name}
              style={{
                ...styles.sidebarLi,
                ...(hoveredItem === item.name ? styles.sidebarLiHover : {}),
                backgroundColor: activeSection === item.name ? "#d81b60" : "transparent",
              }}
              onClick={() => setActiveSection(item.name)}
              onMouseEnter={() => setHoveredItem(item.name)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              {item.icon}
              {sidebarOpen && <span style={styles.sidebarSpan}>{item.name}</span>}
            </li>
          ))}
        </ul>
      </nav>

      <div style={styles.mainContent(sidebarOpen)}>
        {activeSection === "Profile" && (
          <div style={styles.profileContainer}>
            <div style={styles.profileCard}>
              <h3 style={styles.profileTitle}>Profile Information</h3>
              {isEditing ? (
                <div style={styles.editForm}>
                  <input
                    type="text"
                    name="username"
                    value={editFormData.username || ""}
                    onChange={handleInputChange}
                    placeholder="Name"
                    style={styles.inputField}
                  />
                  <input
                    type="email"
                    name="email"
                    value={editFormData.email || ""}
                    onChange={handleInputChange}
                    placeholder="Email"
                    disabled
                    style={{ ...styles.inputField, backgroundColor: "#f0f0f0", cursor: "not-allowed" }}
                  />
                  <input
                    type="text"
                    name="phone"
                    value={editFormData.phone || ""}
                    onChange={handleInputChange}
                    placeholder="Phone"
                    style={styles.inputField}
                  />
                  <div style={styles.editActions}>
                    <button style={styles.saveBtn} onClick={handleSaveChanges}>
                      Save
                    </button>
                    <button style={styles.cancelBtn} onClick={handleEditToggle}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div style={styles.profileIcon}>
                    <FaUser />
                  </div>
                  <div style={styles.profileDetails}>
                    <p style={styles.profileDetailItem}>
                      <strong>Name:</strong> {user.username}
                    </p>
                    <p style={styles.profileDetailItem}>
                      <strong>Email:</strong> {user.email}
                    </p>
                    <p style={styles.profileDetailItem}>
                      <strong>Phone:</strong> {user.phone}
                    </p>
                  </div>
                  <div style={styles.profileActions}>
                    <button style={styles.editBtn} onClick={handleEditToggle}>
                      <FaEdit /> Edit
                    </button>
                    <button style={styles.logoutBtn} onClick={handleLogout}>
                      <FaSignOutAlt /> Logout
                    </button>
                  </div>
                </>
              )}
              {message && (
                <p style={{ ...styles.message, ...(isError ? styles.errorMessage : {}) }}>
                  {message}
                </p>
              )}
            </div>
          </div>
        )}

        {activeSection === "Support" && (
          <div style={styles.supportContainer}>
            <h3 style={styles.supportTitle}>Support</h3>
            <p style={styles.supportText}>
              If you have any questions or need assistance, feel free to contact us at:
            </p>
            <a href="mailto:eventheaven@gmail.com" style={styles.supportEmail}>
              eventheaven@gmail.com
            </a>
          </div>
        )}

        {activeSection === "Payments" && (
          <div style={styles.paymentsContainer}>
            <h3 style={styles.paymentsTitle}>Payment History</h3>
            {payments.length === 0 ? (
              <p style={styles.emptyMessage}>No payment records found.</p>
            ) : (
              <div style={{ overflowX: "auto", width: "100%" }}>
                <table style={styles.dataTable}>
                  <thead style={styles.tableHead}>
                    <tr>
                      <th style={styles.tableHeader}>Booking ID</th>
                      <th style={styles.tableHeader}>Event Type</th>
                      <th style={styles.tableHeader}>Event Date</th>
                      <th style={styles.tableHeader}>Total Price (₹)</th>
                      <th style={styles.tableHeader}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment, index) => (
                      <tr key={payment.booking_id} style={getTableRowClass(index)}>
                        <td style={styles.tableCell}>{payment.booking_id}</td>
                        <td style={styles.tableCell}>{payment.event_type}</td>
                        <td style={styles.tableCell}>{new Date(payment.event_date).toLocaleDateString()}</td>
                        <td style={styles.tableCell}>₹{payment.total_price}</td>
                        <td style={styles.tableCell}>
                          <span style={payment.status === "paid" ? styles.statusPaid : styles.statusPending}>
                            {payment.status === "paid" ? "Paid ✅" : "Pending ❌"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

{activeSection === "Bookings" && (
  <div style={styles.bookingsContainer}>
    <h3 style={styles.bookingsTitle}>My Bookings</h3>
    {bookings.length === 0 ? (
      <p style={styles.emptyMessage}>No bookings found.</p>
    ) : (
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {bookings.map((booking) => (
          <div
            key={booking.booking_id}
            style={{
              ...styles.bookingCard,
              ...(expandedBooking === booking.booking_id ? styles.bookingCardHover : {}),
            }}
            onClick={() => handleBookingClick(booking.booking_id)}
          >
            <div style={styles.bookingHeader}>
              <div style={styles.bookingIcon}>
                <FaCalendarCheck />
              </div>
              
              <div style={styles.bookingContent}>
                <h4 style={styles.bookingTitle}>{booking.hall_name}</h4>
                <p style={styles.bookingText}>Event: {booking.event_type}</p>
                <p style={styles.bookingText}>
                  Date: {new Date(booking.event_date).toLocaleDateString()}
                </p>
                <p style={styles.bookingText}>
                  Status: <span style={styles.statusBadge(booking.status)}>
                    {booking.status}
                  </span>
                </p>
              </div>
              
              <div style={styles.expandIcon}>
                {expandedBooking === booking.booking_id ? (
                  <FaChevronUp />
                ) : (
                  <FaChevronDown />
                )}
              </div>
            </div>

            {expandedBooking === booking.booking_id && (
              <div style={styles.bookingDetails}>
                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>Booking ID:</span>
                  <span style={styles.detailValue}>WAYVOBH{booking.booking_id}</span>
                </div>
                
                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>Total Price:</span>
                  <span style={styles.detailValue}>₹{booking.total_price}</span>
                </div>
                
                {/* <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>Guests:</span>
                  <span style={styles.detailValue}>{booking.guests}</span>
                </div> */}
                
                {booking.additional_services && (
                  <div style={styles.additionalServices}>
                    <h5 style={styles.servicesTitle}>Additional Services:</h5>
                    <div style={styles.servicesList}>
                      {Object.entries(JSON.parse(booking.additional_services)).map(([key, value]) => (
                        <div style={styles.serviceItem} key={key}>
                          <span style={styles.serviceName}>{key}:</span>
                          <span style={styles.servicePrice}>₹{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    )}
  </div>
)}
      </div>
    </div>
  );
};

export default UserDashboard;