import React, { useState, useEffect } from "react";
import './adminLogin.css';
import { useCookies } from "react-cookie";

import { Link, useNavigate } from "react-router-dom";

const AdminSignin = () => {
  const [cookies] = useCookies(["authToken", "vendorToken","adminToken"]);
  const navigate = useNavigate();
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
      const response = await fetch("http://localhost:8500/api/adminlogin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
        credentials: "include",
      });
  
      const data = await response.json();
  
      if (response.ok ) {
        setErrorMessage(""); // Clear error message on success
        navigate("/dashboard");
      } else {
        setErrorMessage(data.message || "Invalid login response"); // Set error message
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage("Failed to log in. Please try again."); // Set error message
    }
  };
  

  return (<>
      <div className="container"> {/* Updated class name for container */}
        <div className="container1"> {/* Updated class name for container */}
          <div className="left-section"> {/* Updated class name for left section */}
            <img src='signup-bg.jpg' alt="Banquet Hall" />
          </div>
          <div className="right-section"> {/* Updated class name for right section */}
            <h2>EventHaven</h2>
            <form onSubmit={handleSubmit} className="form"> {/* Updated class name for form */}
              <input type="email" name="email" placeholder="Email*" required value={formData.email} onChange={handleChange} className="input" />
              <input type="password" name="password" placeholder="Password*" required value={formData.password} onChange={handleChange} className="input" />
              <button type="submit" className="button">Login</button> {/* Updated class name for button */}
            </form>
            {errorMessage && <p style={{ color: "red", fontSize: "16px" }}>{errorMessage}....</p>} {/* Display error message */}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminSignin;
