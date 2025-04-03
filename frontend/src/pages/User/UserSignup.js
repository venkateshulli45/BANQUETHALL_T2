import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./UserAuth.css";

const UserSignup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
  });
  const [otp, setOtp] = useState(["", "", "", ""]); // Changed to 4 boxes
  const otpRefs = [useRef(null), useRef(null), useRef(null), useRef(null)]; // Changed to 4 refs
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

  const sendOtp = async () => {
    try {
      const response = await fetch("http://localhost:8500/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();
      if (response.ok) {
        setOtpSent(true);
        setMessage("OTP sent successfully!");
      } else {
        setErrorMessage(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      setErrorMessage("Failed to send OTP.");
    }
  };

  const verifyOTP = async () => {
    try {
      const otpValue = otp.join('');
      const response = await fetch("http://localhost:8500/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, otp: otpValue }),
      });

      const data = await response.json();
      if (response.ok) {
        setOtpVerified(true);
        setMessage("OTP verified successfully!");
      } else {
        setErrorMessage(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      setErrorMessage("Failed to verify OTP.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otpVerified) {
      setErrorMessage("Please verify OTP before signing up.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8500/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("User registered successfully!");
        navigate("/UserLogin");
      } else {
        setErrorMessage(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error during signup:", error);
      setErrorMessage("Failed to register user.");
    }
  };

  return (
    <div className="container">
      <div className="form-container">
        <div className="left-section">
          <img src='userimage.jpg' alt="Banquet Hall" />
        </div>
        <div className="right-section">
          <h2>Grow your Business with EventHaven</h2>
          <form onSubmit={handleSubmit} className="form">
            <input type="text" name="username" placeholder="User Name" required value={formData.username} onChange={handleChange} className="input" />
            <input type="email" name="email" placeholder="Email*" required value={formData.email} onChange={handleChange} className="input" />
            {!otpSent && <button type="button" onClick={sendOtp} className="button" id="otp">Send OTP</button>}
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
                <button type="button" onClick={verifyOTP} className="button">Verify OTP</button>
              </>
            )}
            <div className="phone-container">
              <span className="phone-code">+91</span>
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
            <input type="password" name="password" placeholder="Password*" required value={formData.password} onChange={handleChange} className="input" />
            <button type="submit" className="button" disabled={!otpVerified}>SignUp</button>
          </form>
          {errorMessage && <p style={{ color: "red", fontSize: "14px" }}>{errorMessage}</p>}
          {message && <p style={{ color: "green", fontSize: "14px" }}>{message}</p>}
          <p style={{ fontSize: "16px", color: "#333" }}>Already have an account? <Link to="/UserLogin">LogIn</Link></p>
          <div className="customer-box">
            <span>Are you a vendor? </span>
            <button onClick={() => navigate("/VendorLogin")} className="customer-button">VendorLogin</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSignup;