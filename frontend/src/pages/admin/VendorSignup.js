import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import './vendorSignup.css';

const VendorSignup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    vendorName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [otp, setOtp] = useState(["", "", "", ""]);
  const otpRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (otpSent && !otpVerified) {
      otpRefs[0].current.focus();
    }
  }, [otpSent, otpVerified]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOtpChange = (index, event) => {
    const value = event.target.value;
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < otpRefs.length - 1) {
      otpRefs[index + 1].current.focus();
    }
  };

  const handleOtpKeyDown = (index, event) => {
    if (event.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs[index - 1].current.focus();
    }
  };

  const sendOTP = async () => {
    setMessage("");
    setErrorMessage("");
    try {
      const response = await fetch("http://localhost:8500/api/vendorAuth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();
      if (response.ok) {
        setOtpSent(true);
        setMessage("OTP sent successfully....");
      } else {
        setErrorMessage(data.message || "Failed to send OTP.");
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      setErrorMessage("Failed to send OTP. Please try again.");
    }
  };

  const verifyOTP = async () => {
    setMessage("");
    setErrorMessage("");
    try {
      const otpValue = otp.join('');
      const response = await fetch("http://localhost:8500/api/vendorAuth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, otp: otpValue }),
      });

      const data = await response.json();
      if (response.ok) {
        setOtpVerified(true);
        setMessage("OTP verified Successfully....");
      } else {
        setErrorMessage(data.message || "Invalid OTP.");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      setErrorMessage("Failed to verify OTP. Please try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otpVerified) {
      setErrorMessage("Please verify OTP before signing up.");
      return;
    }

    const requestData = {
      vendorName: formData.vendorName,
      city: formData.city,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
    };

    try {
      const response = await fetch("http://localhost:8500/api/vendor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("Registration Successfull....");
        navigate("/VendorLogin");
      } else {
        setErrorMessage(data.message || "Registration failed.");
      }
    } catch (error) {
      console.error("Error during signup:", error);
      setErrorMessage("Failed to register vendor. Please try again.");
    }
  };

  const handleCustomer = () => {
    navigate("/userLogin");
  };

  return (
    <div className="container">
      <div className="container1">
        <div className="left-section">
          <img src="signup-bg.jpg" alt="Banquet Hall" />
        </div>
        <div className="right-section">
          <h2>Grow your Business with EventHaven</h2>
          <form onSubmit={handleSubmit} className="form">
            <input
              type="text"
              name="vendorName"
              placeholder="Vendor Name*"
              required
              value={formData.vendorName}
              onChange={handleChange}
              className="input"
            />

            <select name="city" required value={formData.city} onChange={handleChange} className="input">
              <option value="">City (Choose your base city here)*</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="Delhi">Delhi</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Bangalore">Bangalore</option>
            </select>

            <input
              type="email"
              name="email"
              placeholder="Email*"
              required
              value={formData.email}
              onChange={handleChange}
              className="input"
            />
            {!otpSent && (
              <button type="button" onClick={sendOTP} className="button">
                Send OTP
              </button>
            )}
            {otpSent && !otpVerified && (
              <>
                <div className="otp-input-container">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength="1"
                      className="otp-input"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      ref={otpRefs[index]}
                    />
                  ))}
                </div>
                <button type="button" onClick={verifyOTP} className="button">
                  Verify OTP
                </button>
              </>
            )}
            <div className="phone-container">
              <span className="phone-code">🇮🇳 +91</span>
              <input
                type="text"
                name="phone"
                placeholder="Phone Number*"
                required
                value={formData.phone}
                onChange={handleChange}
                className="phone-input"
              />
            </div>
            <input
              type="password"
              name="password"
              placeholder="Password*"
              required
              value={formData.password}
              onChange={handleChange}
              className="input"
            />
            <button type="submit" className="button" disabled={!otpVerified}>
              Signup
            </button>
            {errorMessage && <p className="error-message" style={{ fontSize: "16px", color: "red" }}>{errorMessage}</p>}
            {message && <p style={{ color: "green", fontSize: "14px" }}>{message}</p>}
          </form>
          <p className="para" style={{ fontSize: "16px", color: "#red" }}>
            Already have an account? <Link to="/VendorLogin">Log In</Link>
          </p>
          <div className="customer-box">
            <span>Are you a customer? </span>
            <button className="customer-button" onClick={handleCustomer}>
              User Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorSignup;