import React, { useState, useRef, useEffect } from "react";
import { IoPersonCircle } from "react-icons/io5";
import { MdOutlineDarkMode, MdOutlineLightMode } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Navbar.module.css";
import { useCookies } from "react-cookie";
import { jwtDecode } from "jwt-decode";

const Navbar = () => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [taglineText, setTaglineText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const fullTagline = "Book Your Perfect Venue – Effortlessly!";
  const typingSpeed = 100; // milliseconds per character
  const pauseDelay = 1000; // milliseconds to pause when complete

  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const [cookies] = useCookies(["authToken"]);

  const user = cookies.authToken ? jwtDecode(cookies.authToken) : null;
  const userEmail = user ? user.email : null; // Retrieve email from decoded token
  
  useEffect(() => {
    setIsAuthenticated(!!user);
  }, [user]);

  // Typing animation effect
  useEffect(() => {
    let timeoutId;
    
    if (isTyping) {
      if (taglineText.length < fullTagline.length) {
        timeoutId = setTimeout(() => {
          setTaglineText(fullTagline.substring(0, taglineText.length + 1));
        }, typingSpeed);
      } else {
        // Finished typing, pause before clearing
        timeoutId = setTimeout(() => {
          setIsTyping(false);
        }, pauseDelay);
      }
    } else {
      // Reset and start over
      timeoutId = setTimeout(() => {
        setTaglineText("");
        setIsTyping(true);
      }, pauseDelay / 2);
    }
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [taglineText, isTyping]);

  const toggleDropdown = (type) => {
    setActiveDropdown(activeDropdown === type ? null : type);
  };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    // Logic to apply dark/light theme can be added here
    document.body.classList.toggle("dark-mode");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close dropdown when clicking outside
      if (
        dropdownRef.current && !dropdownRef.current.contains(event.target)
      ) {
        setActiveDropdown(null);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleAuth = (type) => {
    if (type === "logout") {
      document.clearCookie('authToken');
      setIsAuthenticated(false);
      navigate('/');
    } else {
      navigate(type === "login" ? "/userLogin" : "/UserSignup");
    }
    setActiveDropdown(null);
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

  return (
    <div className={styles.navbarContainer}>
      {/* Main Navbar */}
      <div className={styles.mainNav}>
        <div className={styles.logoMenu}>
          <h2>Event Heaven</h2>
          <span className={styles.tagline3D}>
            {taglineText}
            <span className={styles.cursor}></span>
          </span>
        </div>

        {/* Icons */}
        <div className={styles.icons}>
          {/* Theme Switcher - Only show if authenticated */}
          {isAuthenticated && (
            <div className={styles.themeToggle} onClick={toggleTheme}>
              {darkMode ? 
                <MdOutlineLightMode className={styles.icon} /> : 
                <MdOutlineDarkMode className={styles.icon} />
              }
            </div>
          )}

          {/* User Dropdown */}
          <div className={styles.userDropdown} ref={dropdownRef}>
            <IoPersonCircle className={styles.icon} onClick={() => toggleDropdown("profile")} />
            {activeDropdown === "profile" && (
              <div className={styles.loginBox}>
                {isAuthenticated ? (
                  <>
                    <Link to="/UserDashboard">Profile</Link>
{/*                     
                    <Link to="/settings">Settings</Link> */}
                    <button onClick={() => handleLogout()} className={styles.authButton}>Logout</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleAuth("login")} className={styles.authButton}>Login</button>
                    <button onClick={() => handleAuth("signup")} className={styles.authButton}>Signup</button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;