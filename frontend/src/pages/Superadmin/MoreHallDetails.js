import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from './MoreHallDetails.module.css';

const MoreHallDetails = () => {
  const { hallId } = useParams();
  const navigate = useNavigate();
  const [hall, setHall] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isApproved, setIsApproved] = useState(false); // Track approval
  const [isRejected, setIsRejected] = useState(false); // Track rejection status

  useEffect(() => {
    console.log("Captured hallId from URL:", hallId);
    const fetchHallDetails = async () => {
      const url = `http://localhost:8500/api/hallss/${hallId}`;
      console.log("Fetching from:", url); 
    
      try {
        const response = await fetch(url);
        const data = await response.json();
        console.log("Fetched hall data:", data);
    
        setHall(data);
        console.log("Hall data set in state:", data);
        setIsApproved(data.statusOfHall === 1); // Explicitly check if approved
        setIsRejected(data.statusOfHall === 0); // Explicitly check if rejected
    
      } catch (error) {
        console.error("Error fetching hall details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHallDetails();
  }, [hallId]);

  const handleApprove = async () => {
    try {
      const response = await fetch(`http://localhost:8500/api/halls/approve/${hallId}`, {
        method: "PUT",
      });

      const data = await response.json();
      if (response.ok) {
        alert("Hall Approved Successfully!");
        setIsApproved(true); // Hide buttons after approval
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Error approving hall:", error);
      alert("Failed to approve hall.");
    }
  };

  const handleReject = async () => {
    const confirmReject = window.confirm("Are you sure you want to reject this hall and process the refund?");
    if (!confirmReject) return;
  
    try {
      // 1️⃣ Update `statusOfHall` to `0` in Database
      const response = await fetch(`http://localhost:8500/api/halls/reject`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hall_id: hallId, statusOfHall: 0 }), // Send in body
      });
  
      const data = await response.json();
      if (!response.ok) {
        console.error("Failed to update hall status:", data);
        alert(`Error updating status: ${data.message || "Unknown error"}`);
        return;
      }
  
      // 2️⃣ Send Notification
      const notificationResponse = await fetch("http://localhost:8500/api/send-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendor_email: hall.vendor_email,
          message: `Your hall '${hall.hall_name}' has been rejected by the admin. Refund process is initiated.`,
        }),
      });
  
      const notificationData = await notificationResponse.json();
      if (!notificationResponse.ok) {
        console.error("Notification failed:", notificationData);
        alert(`Notification failed: ${notificationData.message || "Unknown error"}`);
        return;
      }
  
      // 3️⃣ Update Frontend UI
      setHall((prevHall) => ({ ...prevHall, statusOfHall: 0 })); // Update UI state
      setIsRejected(true); // Update rejection status
  
      // 4️⃣ Redirect to Refund Page
      navigate(`/refund/${hallId}`, {
        state: { 
          vendorEmail: hall.vendor_email, 
          hallName: hall.hall_name, 
          price: hall.price 
        }
      });
  
    } catch (error) {
      console.error("Error rejecting hall:", error);
      alert("Failed to reject hall.");
    }
  };
  
  if (loading) return <p>Loading...</p>;
  if (!hall) return <p>Hall not found</p>;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{hall.hall_name}</h2>
      <p><strong>Email:</strong> {hall.vendor_email}</p>
      <p><strong>City:</strong> {hall.city}</p>
      <p><strong>Capacity:</strong> {hall.capacity}</p>
      <p><strong>Description:</strong> {hall.description}</p>
      <p><strong>Price:</strong> ₹{hall.price}</p>
      <p><strong>Status:</strong> {isApproved ? "Approved" : isRejected ? "Rejected" : "Under Process"}</p>
      <p><strong>Payment Status:</strong> {hall.payment_status}</p>

      {/* Hide buttons if hall is approved or rejected */}
      {!isApproved && !isRejected && (
        <div className={styles.buttonGroup}>
          <button className={styles.approveButton} onClick={handleApprove}>
            Approve Hall
          </button>
          <button className={styles.rejectButton} onClick={handleReject}>
            Reject Hall & Refund
          </button>
        </div>
      )}

      {/* Show refund button if hall is rejected */}
      {isRejected && (
        <button className={styles.refundButton} onClick={() => navigate(`/refund/${hallId}`, { state: { vendorEmail: hall.vendor_email, hallName: hall.hall_name, price: hall.price } })}>
          Process Refund
        </button>
      )}
    </div>
  );
};

export default MoreHallDetails;
