import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faSpinner } from '@fortawesome/free-solid-svg-icons';
import styles from './vendorstyles/HallList.module.css';

const HallList = ({ vendorDetails, isDarkTheme }) => {
  const [hotelData, setHotelData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookedHalls, setBookedHalls] = useState(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    if (vendorDetails?.email) {
      fetchHalls();
      fetchBookedHalls();
    }
  }, [vendorDetails]);
  
  useEffect(() => {
    console.log("Updated Booked Halls:", bookedHalls); // Debugging
  }, [bookedHalls]);

  const fetchHalls = async () => {
    try {
      const response = await fetch(`http://localhost:8500/api/halls/${vendorDetails.email}`);
      const data = await response.json();
      console.log("API Response:", data); // Debug log
      
      if (Array.isArray(data.halls)) {
        setHotelData(data.halls);
      } else {
        console.error("Expected an array but got:", data);
        setHotelData([]);
      }
    } catch (error) {
      console.error("Error fetching hotels:", error);
      setHotelData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookedHalls = async () => {
    try {
      const response = await fetch("http://localhost:8500/api/booked-halls");
      const data = await response.json();
      const bookedHallIds = new Set(data.map((booking) => booking.hall_id));
      setBookedHalls(bookedHallIds);
    } catch (error) {
      console.error("Error fetching booked halls:", error);
    }
  };
  const getStatusText = (statusCode) => {
    switch(statusCode) {
      case 0: return "Rejected";
      case 1: return "Approved";
      case 2: return "Pending";
      default: return "Unknown";
    }
  };

  const handleDelete = (id) => {
    if (bookedHalls.has(id)) {
      window.alert("This hall has active bookings and cannot be deleted.");
      return; // Prevent further execution
    }
  
    if (window.confirm("Are you sure you want to delete this hall?")) {
      fetch(`http://localhost:8500/api/halls/${id}`, {
        method: "DELETE",
      })
        .then((response) => {
          if (response.ok) {
            setHotelData((prevData) => prevData.filter((hotel) => hotel.id !== id));
            window.alert("Hall deleted successfully.");
          } else {
            window.alert("Failed to delete the hall. Please try again.");
          }
        })
        .catch(() => {
          window.alert("An error occurred while deleting the hall.");
        });
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <FontAwesomeIcon 
          icon={faSpinner} 
          spin 
          size="2x" 
          color={isDarkTheme ? "#ff6b9d" : "#e91e63"} 
        />
        <p style={{ color: isDarkTheme ? "#b0b0b0" : "#666" }}>Loading halls...</p>
      </div>
    );
  }

  return (
    <div className={styles.hallListContainer}>
      <div className={styles.header}>
        <h2 style={{ color: isDarkTheme ? "#ff6b9d" : "#e91e63" }}>Your Halls</h2>
        <button 
          className={styles.addHallButton} 
          onClick={() => navigate("/Halldetails")}
          style={{ 
            background: isDarkTheme ? "#ff6b9d" : "#e91e63",
            '&:hover': {
              background: isDarkTheme ? "#e55d8b" : "#d81b60"
            }
          }}
        >
          <FontAwesomeIcon icon={faPlus} /> Add New Hall
        </button>
      </div>

      {hotelData.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No halls added yet.</p>
          <button 
            className={styles.addHallButton} 
            onClick={() => navigate("/Halldetails")}
            style={{ 
              background: isDarkTheme ? "#ff6b9d" : "#e91e63",
              '&:hover': {
                background: isDarkTheme ? "#e55d8b" : "#d81b60"
              }
            }}
          >
            <FontAwesomeIcon icon={faPlus} /> Add New Hall
          </button>
        </div>
      ) : (
        <div className={styles.tableResponsive}>
          <table className={styles.hallTable}>
            <thead>
              <tr>
                <th>Hall Name</th>
                <th>Capacity</th>
                <th>Price</th>
                <th>City</th>
                <th>Location</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {hotelData.map((hotel) => (
                <tr key={hotel.id}>
                  <td>{hotel.hall_name}</td>
                  <td>{hotel.capacity}</td>
                  <td>₹{hotel.price}</td>
                  <td>{hotel.city}</td>
                  <td>{hotel.location}</td>
                  <td>
                    <span className={`
                      ${styles.statusBadge} 
                      ${hotel.statusOfHall === 0 ? styles.rejected : ''}
                      ${hotel.statusOfHall === 1 ? styles.approved : ''}
                      ${hotel.statusOfHall === 2 ? styles.pending : ''}
                    `}>
                      {getStatusText(hotel.statusOfHall)}
                    </span>
                  </td>
                  <td>
                    <button
                      className={styles.deleteButton}
                      onClick={() => handleDelete(hotel.id)}
                      disabled={bookedHalls.has(hotel.id)} // Disable if booked
                      title={
                        bookedHalls.has(hotel.id)
                          ? "Cannot delete booked hall"
                          : "Delete Hall"
                      }
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default HallList;