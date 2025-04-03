import React, { useEffect, useState } from "react";
import styles from "./ManageVendors.module.css";

const ManageVendors = () => {
  const [vendors, setVendors] = useState([]);

  // Fetch vendors from the database
  useEffect(() => {
    fetch("http://localhost:8500/api/vendors")
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data.vendors)) {
          setVendors(data.vendors);
        } else {
          console.error("Invalid data format:", data);
          setVendors([]);
        }
      })
      .catch((error) => console.error("Error fetching vendors:", error));
  }, []);

  // Delete vendor function
  const handleDeleteVendor = async (email) => {
    if (!window.confirm("Are you sure you want to delete this vendor?")) return;

    try {
      const response = await fetch(`http://localhost:8500/api/vendors/${email}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setVendors((prevVendors) => prevVendors.filter((vendor) => vendor.email !== email));
        console.log(`Vendor with email ${email} deleted successfully.`);
      } else {
        console.error("Failed to delete vendor:", await response.json());
      }
    } catch (error) {
      console.error("Error deleting vendor:", error);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Manage Vendors</h2>
      
      {vendors.length === 0 ? (
        <p className={styles.noVendors}>No vendors found.</p>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Vendor Name</th>
                <th>Brand Name</th>
                <th>Email</th>
                <th>Phone Number</th>
                <th>City</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((vendor, index) => (
                <tr key={index}>
                  <td>{vendor.vendor_name}</td>
                  <td>{vendor.brand_name}</td>
                  <td>{vendor.email}</td>
                  <td>{vendor.phone}</td>
                  <td>{vendor.city}</td>
                  <td>
                    <button className={styles.deleteBtn} onClick={() => handleDeleteVendor(vendor.email)}>
                      Delete
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

export default ManageVendors;
