import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./RefundPage.module.css"; // Import the CSS file

const RefundPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { vendorEmail, hallName, price } = location.state || {};
  const [bankDetails, setBankDetails] = useState(null);

  useEffect(() => {
    const fetchBankDetails = async () => {
      try {
        const response = await fetch(`http://localhost:8500/api/get-bank-details?email=${vendorEmail}`);
        const data = await response.json();
        if (data.success) {
          setBankDetails(data.bankDetails);
        } else {
          alert("Bank details not found for this vendor.");
        }
      } catch (error) {
        console.error("Error fetching bank details:", error);
      }
    };

    fetchBankDetails();
  }, [vendorEmail]);

  const handleProcessRefund = async () => {
    if (!vendorEmail) {
      alert("Vendor email is missing!");
      return;
    }
  
    console.log("Refunding for Vendor Email:", vendorEmail);
  
    if (!bankDetails) {
      alert("Cannot process refund without bank details.");
      return;
    }
  
    try {
      console.log("Sending refund request:", {
        vendor_email: vendorEmail,
        hall_name: hallName,
        amount: 40000,
      });
  
      // 1️⃣ **Process the Refund**
      const response = await fetch("http://localhost:8500/api/process-refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendor_email: vendorEmail,
          hall_name: hallName,
          amount: 40000,
        }),
      });
  
      const data = await response.json();
      console.log("Refund API Response:", data); // Debugging
  
      if (!response.ok) {
        console.error("Refund failed:", data);
        alert(`Refund failed: ${data.message || "Unknown error"}`);
        return;
      }
  
      // 2️⃣ **Update Hall Status to "Rejected"**
      console.log("Updating hall status...");
      const rejectResponse = await fetch(`http://localhost:8500/api/halls/reject`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hall_name: hallName }),
      });
  
      const rejectData = await rejectResponse.json();
      console.log("Reject Hall Response:", rejectData);
  
      if (!rejectResponse.ok) {
        console.error("Failed to update hall status:", rejectData);
        alert(`Hall status update failed: ${rejectData.message || "Unknown error"}`);
        return;
      }
  
      // 3️⃣ **Send a Notification to Vendor**
      console.log("Sending notification...");
      const notificationResponse = await fetch("http://localhost:8500/api/send-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendor_email: vendorEmail,
          message: `Your hall '${hallName}' has been rejected by the admin. A refund of ${price} has been processed.`,
        }),
      });
  
      const notificationData = await notificationResponse.json();
      console.log("Notification API Response:", notificationData);
  
      if (!notificationResponse.ok) {
        console.error("Notification failed:", notificationData);
        alert(`Notification failed: ${notificationData.message || "Unknown error"}`);
        return;
      }
  
      alert("Refund Processed & Notification Sent!");
      navigate("/dashboard");
  
    } catch (error) {
      console.error("Error processing refund:", error);  // Now logs detailed error
      alert("Failed to process refund. Check console for details.");
    }
  };
  
  
  
  

  return (
    <div className={styles.refundContainer}>
      <h2>Refund Details</h2>
      {bankDetails ? (
        <div className={styles.refundDetails}>
          <p><strong>Vendor Email:</strong> {vendorEmail}</p>
          <p><strong>Hall Name:</strong> {hallName}</p>
          <p><strong>Refund Amount:</strong> ₹40000</p>
          <p><strong>Account Holder:</strong> {bankDetails.account_holder}</p>
          <p><strong>Bank Name:</strong> {bankDetails.bank_name}</p>
          <p><strong>Account Number:</strong> {bankDetails.account_number}</p>
          <p><strong>IFSC Code:</strong> {bankDetails.ifsc_code}</p>

          <button onClick={handleProcessRefund} className={styles.refundButton}>
            Confirm & Process Refund
          </button>
        </div>
      ) : (
        <p>Loading bank details...</p>
      )}
    </div>
  );
};

export default RefundPage;
