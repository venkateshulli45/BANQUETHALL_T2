import React, { useState, useRef, useEffect } from 'react';
import { IoPersonCircle } from 'react-icons/io5';
import { MdOutlineDarkMode, MdOutlineLightMode } from 'react-icons/md';
import { Link, useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import { jwtDecode } from 'jwt-decode';
import { useTheme } from '../../context/ThemeContext';
import styles from './Navbar.module.css';

const Navbar = () => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);


  const [darkMode, setDarkMode] = useState(true);
  const [taglineText, setTaglineText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const [cookies] = useCookies(['authToken']);
  const { theme, toggleTheme } = useTheme('dark');

  const user = cookies.authToken ? jwtDecode(cookies.authToken) : null;
  const fullTagline = "Book Your Perfect Venue – Effortlessly!";

  // Authentication state
  useEffect(() => {
    setIsAuthenticated(!!user);
  }, [user]);

  // Typing animation effect
  useEffect(() => {
    let timeoutId;
    
    if (isTyping && taglineText.length < fullTagline.length) {
      timeoutId = setTimeout(() => {
        setTaglineText(fullTagline.substring(0, taglineText.length + 1));
      }, 100);
    } else if (isTyping) {
      timeoutId = setTimeout(() => setIsTyping(false), 1000);
    } else {
      timeoutId = setTimeout(() => {
        setTaglineText('');
        setIsTyping(true);
      }, 500);
    }
    
    return () => clearTimeout(timeoutId);
  }, [taglineText, isTyping]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auth handlers
  const handleAuth = (type) => {
    if (type === 'logout') {
      document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      setIsAuthenticated(false);
      navigate('/');
    } else {
      navigate(type === 'login' ? '/userLogin' : '/UserSignup');
    }
    setActiveDropdown(null);
  };

  return (
    <div className={styles.navbarContainer}>
      {/* Top Announcement Bar */}
      {/* <div className={styles.topBar}>
        <button className={styles.topButton}>Special Offer!</button>
      </div> */}

      {/* Main Navigation */}
      <div className={styles.mainNav}>
        <div className={styles.logoMenu}>
          <h2>Event Heaven</h2>
          <span className={styles.tagline3D}>
            {taglineText}
            <span className={styles.cursor}></span>
          </span>
        </div>

        <div className={styles.icons}>
          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className={styles.themeToggle}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? (
              <MdOutlineDarkMode className={styles.icon} />
            ) : (
              <MdOutlineLightMode className={styles.icon} />
            )}
          </button>

          {/* User Dropdown */}
          <div className={styles.userDropdown} ref={dropdownRef}>
            <IoPersonCircle
              className={styles.icon}
              onClick={() => setActiveDropdown(activeDropdown === 'profile' ? null : 'profile')}
              aria-label="User profile"
            />
            
            {activeDropdown === 'profile' && (
              <div className={styles.loginBox}>
                {isAuthenticated ? (
                  <>
                    <Link to="/UserDashboard">Profile</Link>
                    <button 
                      onClick={() => handleAuth('logout')} 
                      className={styles.authButton}
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => handleAuth('login')} 
                      className={styles.authButton}
                    >
                      Login
                    </button>
                    <button 
                      onClick={() => handleAuth('signup')} 
                      className={styles.authButton}
                    >
                      Signup
                    </button>
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