import React from "react";
import { Link } from "react-router-dom";
import styles from "./Footer.module.css"; // Import the CSS module

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerTop}>
        <div className={styles.footerSection}>
          <h3>Event Heaven - Your Personal Wedding Planner</h3>
          <p>
            Plan your wedding with us. Get the best quotes from top vendors and book your date! 
            Browse for more wedding venues and vendors at WedMeGood and plan your wedding hassle-free.
          </p>
        </div>

        <div className={styles.footerSection}>
          <h3>Registered Address</h3>
          <p>Second Floor, Ocus Technopolis, Sector 54 Golf Course Road, Gurgaon, Haryana, India, 122002</p>
        </div>

        <div className={styles.footerSection}>
          <h3>Follow us on:</h3>
          <ul className={styles.socialLinks}>
            <li><Link to="#">Facebook</Link></li>
            <li><Link to="#">Twitter</Link></li>
            <li><Link to="#">Pinterest</Link></li>
            <li><Link to="#">Instagram</Link></li>
            <li><Link to="#">YouTube</Link></li>
          </ul>
        </div>

        <div className={styles.footerSection}>
          <h3>Start Planning</h3>
          <ul>
            <li><Link to="#">Search By Vendor</Link></li>
            <li><Link to="#">Search By City</Link></li>
            <li><Link to="#">Download Our App</Link></li>
            <li><Link to="#">Top Rated Vendors</Link></li>
            <li><Link to="#">Destination Wedding</Link></li>
          </ul>
        </div>

        <div className={styles.footerSection}>
          <h3>Home</h3>
          <ul>
            <li><Link to="#">About Event Heaven</Link></li>
            <li><Link to="#">Careers</Link></li>
            <li><Link to="#">Contact Us</Link></li>
            <li><Link to="#">Site Map</Link></li>
            <li><Link to="#">Terms & Conditions</Link></li>
            <li><Link to="#">Privacy Policy</Link></li>
            <li><Link to="#">Cancellation Policy</Link></li>
          </ul>
        </div>
      </div>

      <hr />

      <div className={styles.footerBottomText}>
        <p>
          &copy; 2025 Event Heaven | <Link to="#">Terms & Conditions</Link> | <Link to="#">Privacy Policy</Link>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
