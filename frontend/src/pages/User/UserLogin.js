import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import "./UserAuth.css"; 

const UserLogin = () => { 
  const navigate = useNavigate(); 
  const [cookies] = useCookies(["authToken", "vendorToken"]);
  useEffect(() => {
    if (cookies.vendorToken) {
      navigate("/vendorhomepage"); // Redirect to dashboard if logged in
    }
    else if(cookies.authToken){
      navigate("/userDashboard"); // Redirect to dashboard if logged in
    }
  }, [cookies, navigate]);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = useState(""); // New state for error messages

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8500/api/user-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        navigate("/");  // Redirect to the dashboard page
      } else {
        setErrorMessage(data.message); // Set error message instead of alert
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage("Failed to login."); // Set generic error message
    }
  };

  const handleVendor = () => {
    navigate('/vendorLogin');
  };

  return (
    <div className="container">
      <div className="form-container">
        <div className="left-section">
          <img src='userimage.jpg' alt="Banquet Hall" />
        </div>
        <div className="right-section">
          <h1>User Sign In</h1>
          <form onSubmit={handleSubmit} className="form">
            <input
              type="email"
              name="email"
              placeholder="Email*"
              required
              value={formData.email}
              onChange={handleChange}
              className="input"
            />
            <input
              type="password"
              name="password"
              placeholder="Password*"
              required
              value={formData.password}
              onChange={handleChange}
              className="input"
            />
            <Link to='/ForgotPassword' className="forgot-password-link">
              Forgot Password?
            </Link>
            <button type="submit" className="button">Sign In</button>
            {errorMessage && <p style={{ color: "red", fontSize: "small" }}>{errorMessage}</p>} {/* Display error message */}
            <p style={{ fontSize: "16px", color: "#333" }}>Don't have an account? <Link to="/userSignup">Sign Up</Link></p>
          </form>
          <div className="customer-box">
            <span>Are you a Vendor?</span>
            <button className="customer-button" onClick={handleVendor}>Vendor Login</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;
