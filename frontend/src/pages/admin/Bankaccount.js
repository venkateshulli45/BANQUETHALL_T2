import React, { useState, useEffect } from "react";
import styles from './vendorstyles/BankAccount.module.css';

const BankAccount = ({ vendorDetails, initialData, onBankSaved, onCancel }) => {
  const [formData, setFormData] = useState({
    accountHolder: "",
    accountNumber: "",
    ifscCode: "",
    bankName: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        accountHolder: initialData.account_holder || "",
        accountNumber: initialData.account_number || "",
        ifscCode: initialData.ifsc_code || "",
        bankName: initialData.bank_name || "",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const dataToSend = {
      account_holder: formData.accountHolder,
      account_number: formData.accountNumber,
      ifsc_code: formData.ifscCode,
      bank_name: formData.bankName,
      email: vendorDetails?.email,
    };

    try {
      const response = await fetch("http://localhost:8500/api/add-bank-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      const result = await response.json();

      if (response.ok) {
        alert(result.message);
        onBankSaved();
        onCancel();
      } else {
        throw new Error(result.error || "Failed to save bank details.");
      }
    } catch (error) {
      console.error("Error saving bank details:", error);
      alert(error.message);
    }
  };

  return (
    <div className={styles.bankAccountContainer}>
      <div className={styles.bankHeader}>
        <h2>{initialData ? "Update Bank Account" : "Add Bank Account"}</h2>
      </div>
      <form onSubmit={handleSubmit} className={styles.bankForm}>
        <div className={styles.bankField}>
          <label>Account Holder:</label>
          <input
            type="text"
            name="accountHolder"
            value={formData.accountHolder}
            onChange={handleChange}
            required
          />
        </div>
        <div className={styles.bankField}>
          <label>Account Number:</label>
          <input
            type="text"
            name="accountNumber"
            value={formData.accountNumber}
            onChange={handleChange}
            required
          />
        </div>
        <div className={styles.bankField}>
          <label>IFSC Code:</label>
          <input
            type="text"
            name="ifscCode"
            value={formData.ifscCode}
            onChange={handleChange}
            required
          />
        </div>
        <div className={styles.bankField}>
          <label>Bank Name:</label>
          <input
            type="text"
            name="bankName"
            value={formData.bankName}
            onChange={handleChange}
            required
          />
        </div>
        <div className={styles.buttonGroup}>
          <button type="submit" className={styles.saveBtn}>
            {initialData ? "Update" : "Save"}
          </button>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default BankAccount;