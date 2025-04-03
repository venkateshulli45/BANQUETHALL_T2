import React, { useState, useEffect } from "react";
import './vendorSignup.css';
import { useCookies } from "react-cookie";

import { Link, useNavigate } from "react-router-dom";

const VendorSignin = () => {
  const [cookies] = useCookies(["authToken", "vendorToken"]);
  const navigate = useNavigate();
  useEffect(() => {
      if (cookies.vendorToken) {
        navigate("/vendorhomepage"); // Redirect to dashboard if logged in
      }
      else if(cookies.authToken){
        navigate("/userDashboard"); // Redirect to dashboard if logged in
      }
    }, [cookies.vendorToken, navigate]);
  const [formData, setFormData] = useState({
    brandName: "",
    city: "",
    vendorType: "",
    email: "",
    phone: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = useState(""); // Added errorMessage state

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const response = await fetch("http://localhost:8500/api/vendor-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
        credentials: "include",
      });
  
      const data = await response.json();
  
      if (response.ok && data.vendor?.id) {
        setErrorMessage(""); // Clear error message on success
        navigate("/vendorhomepage");
      } else {
        setErrorMessage(data.message || "Invalid login response"); // Set error message
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage("Failed to log in. Please try again."); // Set error message
    }
  };
  
  const handleCustomer = () => {
    navigate("/userLogin");
  }

  return (<>
      <div className="container"> {/* Updated class name for container */}
        <div className="container1"> {/* Updated class name for container */}
          <div className="left-section"> {/* Updated class name for left section */}
            <img src='signup-bg.jpg' alt="Banquet Hall" />
          </div>
          <div className="right-section"> {/* Updated class name for right section */}
            <h2>Grow your Business with EventHaven</h2>
            <form onSubmit={handleSubmit} className="form"> {/* Updated class name for form */}
              <input type="email" name="email" placeholder="Email*" required value={formData.email} onChange={handleChange} className="input" />
              <input type="password" name="password" placeholder="Password*" required value={formData.password} onChange={handleChange} className="input" />
              <Link to='/forgotpasswordvendor' className="forgot-password-link">
              Forgot Password?
              </Link>
              <button type="submit" className="button">Login</button> {/* Updated class name for button */}
            </form>
            {errorMessage && <p style={{ color: "red", fontSize: "16px" }}>{errorMessage}....</p>} {/* Display error message */}
            <p style={{ fontSize: "16px", color: "#333" }}>Create new Account <Link to="/vendorSignup">Sign Up</Link></p>
            <div className="customer-box"> {/* Updated class name for customer box */}
              <span>Are you a customer?</span>
              <button className="customer-button" onClick={handleCustomer}>Customer Login</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default VendorSignin;
