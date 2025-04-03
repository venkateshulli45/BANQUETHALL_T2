import React, { useEffect, useState } from "react";
import styles from "./IssuesDisplay.module.css";

const IssuesDisplay = () => {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch("http://localhost:8500/api/payments/getReports");
        const data = await response.json();
        setReports(data);
      } catch (error) {
        console.error("Error fetching reports:", error);
      }
    };

    fetchReports();
  }, []);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Payments Display</h2>
      {reports.length > 0 ? (
        <div className={styles.tableWrapper}>
          <table className={styles.reportTable}>
            <thead>
              <tr>
                <th>Vendor Name</th>
                <th>Vendor Email</th>
                <th>Hall Name</th>
                <th>Payment Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report, index) => (
                <tr key={index}>
                  <td>{report.vendor_name}</td>
                  <td>{report.vendor_email}</td>
                  <td>{report.hall_name}</td>
                  <td>{report.payment_status}</td>
                  <td>{new Date(report.date).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={styles.comingSoon}>
          <p>No reports available yet.</p>
        </div>
      )}
    </div>
  );
};

export default IssuesDisplay;