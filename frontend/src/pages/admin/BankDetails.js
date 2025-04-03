import React, { useState, useEffect } from "react";
import BankAccount from "./Bankaccount";
import styles from './vendorstyles/BankDetails.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faBank } from '@fortawesome/free-solid-svg-icons';

const BankDetails = ({ vendorDetails }) => {
  const [bankDetails, setBankDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBankAccountForm, setShowBankAccountForm] = useState(false);

  useEffect(() => {
    if (!vendorDetails?.email) {
      setLoading(false);
      return;
    }
    fetchBankDetails();
  }, [vendorDetails?.email]);

  const fetchBankDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8500/api/get-bank-details?email=${vendorDetails.email}`);
      const result = await response.json();

      if (response.ok && result.bankDetails) {
        setBankDetails(result.bankDetails);
      } else {
        setBankDetails(null);
      }
    } catch (error) {
      console.error("Error fetching bank details:", error);
      alert("Failed to load bank details. Please try again.");
      setBankDetails(null);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBankDetails = () => {
    setShowBankAccountForm(true);
  };

  const handleBankSaved = async (updatedData) => {
    try {
      const response = await fetch("http://localhost:8500/api/add-bank-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...updatedData, email: vendorDetails.email }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        alert("Bank details updated successfully!");
        setBankDetails(updatedData);
        setShowBankAccountForm(false);
        setTimeout(fetchBankDetails, 500);
      } else {
        console.error("API returned failure:", result);
      }
    } catch (error) {
      console.error("Error updating bank details:", error);
      alert("Server error. Please try again later.");
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading bank details...</p>
      </div>
    );
  }

  return (
    <div className={styles.bankDetailsContainer}>
      {showBankAccountForm ? (
        <BankAccount
          vendorDetails={vendorDetails}
          initialData={bankDetails}
          onBankSaved={handleBankSaved}
          onCancel={() => {
            setShowBankAccountForm(false);
            fetchBankDetails();
          }}
        />
      ) : bankDetails ? (
        <>
          <div className={styles.bankHeader}>
            <FontAwesomeIcon icon={faBank} className={styles.bankIcon} />
            <h2>Bank Details</h2>
          </div>
          <div className={styles.bankInfo}>
            <div className={styles.bankField}>
              <label>Account Holder:</label>
              <span>{bankDetails.account_holder || "N/A"}</span>
            </div>
            <div className={styles.bankField}>
              <label>Account Number:</label>
              <span>{bankDetails.account_number || "N/A"}</span>
            </div>
            <div className={styles.bankField}>
              <label>IFSC Code:</label>
              <span>{bankDetails.ifsc_code || "N/A"}</span>
            </div>
            <div className={styles.bankField}>
              <label>Bank Name:</label>
              <span>{bankDetails.bank_name || "N/A"}</span>
            </div>
          </div>
          <div className={styles.buttonGroup}>
            <button className={styles.updateBtn} onClick={handleUpdateBankDetails}>
              <FontAwesomeIcon icon={faEdit} /> Update Bank Details
            </button>
          </div>
        </>
      ) : (
        <div className={styles.noBankDetails}>
          <FontAwesomeIcon icon={faBank} className={styles.largeBankIcon} />
          <p>No bank details found. Please add your bank details.</p>
          <button className={styles.addBtn} onClick={handleUpdateBankDetails}>
            Add Bank Account
          </button>
        </div>
      )}
    </div>
  );
};

export default BankDetails;