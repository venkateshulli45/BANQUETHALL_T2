import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faUser,
  faBell,
  faMoneyCheck,
  faClockRotateLeft,
  faHotel,
  faSignOutAlt,
  faMoon,
  faSun,
  faQuestionCircle,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./vendorstyles/homepage.module.css";
import Profile from "./profile";
import BankAccount from "./Bankaccount";
import HallList from "./HallList";
import Notifications from "./Notification";
import History from "./History";
import BankDetails from "./BankDetails";
import HowToUse from "./HowToUse";
import { useCookies } from "react-cookie";
import { jwtDecode } from "jwt-decode";

const VendorHomePage = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState("hotels");
  const [vendor, setVendor] = useState(null); // Start with null
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [cookies] = useCookies(["vendorToken"]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (cookies.vendorToken) {
      try {
        const decodedVendor = jwtDecode(cookies.vendorToken);
        setVendor(decodedVendor); // Only set vendor once when token is decoded
      } catch (error) {
        console.error("Error decoding token:", error);
        navigate("/VendorLogin"); // If token is invalid, redirect to login
      }
    } else {
      navigate("/VendorLogin"); // If there's no token, redirect to login
    }
  }, [cookies, navigate]); // Only trigger when cookies change

  useEffect(() => {
    if (vendor && vendor.id) {
      const fetchVendorDetails = async () => {
        try {
          const response = await fetch(
            `http://localhost:8500/api/vendor/${vendor.id}`
          );
          const data = await response.json();

          if (response.ok) {
            setVendor(data.vendor); // Update vendor details
          } else {
            console.error("Error fetching vendor details:", data.message);
          }
        } catch (error) {
          console.error("Error fetching vendor details:", error);
        }
      };

      fetchVendorDetails();
    }
  }, [vendor, navigate]); // Only fetch vendor details when vendor info changes

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleMenuClick = (menu) => {
    setSelectedMenu(menu);
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:8500/api/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const updateVendorDetails = (updatedData) => {
    setVendor(updatedData); // Update vendor details
  };

  const renderContent = () => {
    switch (selectedMenu) {
      case "profile":
        return vendor ? (
          <Profile
            vendorDetails={vendor}
            onUpdate={updateVendorDetails}
            isDarkTheme={isDarkTheme}
          />
        ) : (
          <p>Loading...</p>
        );
      case "bank":
        return <BankDetails vendorDetails={vendor} />;
      case "Add_Bank":
        return <BankAccount vendorDetails={vendor} />;
      case "notifications":
        return <Notifications isDarkTheme={isDarkTheme} />;
      case "history":
        return <History  isDarkTheme={isDarkTheme} />;
      case "how-to-use":
        return <HowToUse isDarkTheme={isDarkTheme} />;
      case "hotels":
        return <HallList vendorDetails={vendor} isDarkTheme={isDarkTheme} />;
      default:
        return <HallList vendorDetails={vendor} />;
    }
  };

  const handlePersonIconClick = () => {
    setSelectedMenu("profile");
  };

  const handleNotificationIconClick = () => {
    setSelectedMenu("notifications");
  };

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
  };

  return (
    <div
      className={`${styles.container} ${
        isDarkTheme ? styles.darkTheme : styles.lightTheme
      }`}
    >
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.menuIcon} onClick={toggleSidebar}>
            <FontAwesomeIcon icon={faBars} size="lg" />
            <span className={styles.tooltip}>Menu</span>
          </button>
          <span className={styles.username}>Hello, {vendor?.vendor_name}</span>
        </div>
        <div className={styles.headerRight}>
          <button className={styles.iconBtn} onClick={handlePersonIconClick}>
            <FontAwesomeIcon icon={faUser} size="lg" />
            <span className={styles.tooltip}>Profile</span>
          </button>

          <button className={styles.iconBtn} onClick={handleNotificationIconClick}>
            <FontAwesomeIcon icon={faBell} size="lg" />
            <span className={styles.tooltip}>Notifications</span>
          </button>

          <button className={styles.iconBtn} onClick={toggleTheme}>
            <FontAwesomeIcon icon={isDarkTheme ? faSun : faMoon} size="lg" />
            <span className={styles.tooltip}>
              {isDarkTheme ? "Switch to Light Mode" : "Switch to Dark Mode"}
            </span>
          </button>

          <button className={styles.logoutBtn} onClick={handleLogout}>
            <FontAwesomeIcon icon={faSignOutAlt} />
            <span>Logout</span>
            <span className={styles.tooltipLogout}>Log out of your account</span>
          </button>
        </div>
      </header>

      <div className={styles.main}>
        <div
          className={`${styles.sidebar} ${isSidebarOpen ? styles.open : ""}`}
        >
          <button
            className={styles.sidebarBtn}
            onClick={() => handleMenuClick("profile")}
          >
            <div className={styles.iconContainer}>
              <FontAwesomeIcon icon={faUser} size="lg" />
            </div>
            <span>Profile</span>
          </button>
          <button
            className={styles.sidebarBtn}
            onClick={() => handleMenuClick("bank")}
          >
            <div className={styles.iconContainer}>
              <FontAwesomeIcon icon={faMoneyCheck} size="lg" />
            </div>
            <span>Bank Account</span>
          </button>
          <button
            className={styles.sidebarBtn}
            onClick={() => handleMenuClick("notifications")}
          >
            <div className={styles.iconContainer}>
              <FontAwesomeIcon icon={faBell} size="lg" />
            </div>
            <span>Notifications</span>
          </button>
          <button
            className={styles.sidebarBtn}
            onClick={() => handleMenuClick("history")}
          >
            <div className={styles.iconContainer}>
              <FontAwesomeIcon icon={faClockRotateLeft} size="lg" />
            </div>
            <span>History</span>
          </button>
          <button
            className={styles.sidebarBtn}
            onClick={() => handleMenuClick("hotels")}
          >
            <div className={styles.iconContainer}>
              <FontAwesomeIcon icon={faHotel} size="lg" />
            </div>
            <span>Halls</span>
          </button>
          <button
            className={styles.sidebarBtn}
            onClick={() => handleMenuClick("how-to-use")}
          >
            <div className={styles.iconContainer}>
              <FontAwesomeIcon icon={faQuestionCircle} size="lg" />
            </div>
            <span>How to Use</span>
          </button>
        </div>

        <div
          className={`${styles.content} ${
            isSidebarOpen && isMobile ? styles.blurred : ""
          }`}
        >
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default VendorHomePage;
