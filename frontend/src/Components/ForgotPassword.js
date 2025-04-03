import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import './forgotPassword.css'; // Ensure the CSS file is imported

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const otpRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];
  const [newPassword, setNewPassword] = useState("");
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = Enter Email, 2 = Enter OTP, 3 = Reset Password
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (step === 2) {
      otpRefs[0].current.focus();
    }
  }, [step]);

  const handleOtpChange = (index, event) => {
    const value = event.target.value;
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move focus to the next input if a digit is entered
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
    setMessage("");
    setError("");
    try {
      const response = await fetch("http://localhost:8500/api/forgotPassword/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("OTP sent to your email.");
        setStep(2);
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error("Error sending OTP:", err);
      setError("Failed to send OTP.");
    }
  };

  const verifyOtp = async () => {
    setMessage("");
    setError("");
    try {
      const otpValue = otp.join('');
      const response = await fetch("http://localhost:8500/api/forgotPassword/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpValue }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("OTP verified! You can now reset your password.");
        setStep(3);
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error("Error verifying OTP:", err);
      setError("Failed to verify OTP.");
    }
  };

  const resetPassword = async () => {
    setMessage("");
    setError("");
    try {
      const response = await fetch("http://localhost:8500/api/forgotPassword/resetPassword", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("Password reset successful!");
        navigate("/userlogin");
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error("Error resetting password:", err);
      setError("Failed to reset password.");
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-box">
        <FaArrowLeft
          className="back-icon"
          onClick={() => navigate(-1)}
        />
        <h2>Forgot Password</h2>
        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}
        {step === 1 && (
          <div>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button onClick={sendOtp}>Send OTP</button>
          </div>
        )}
        {step === 2 && (
          <div>
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
            <button onClick={verifyOtp}>Verify OTP</button>
          </div>
        )}
        {step === 3 && (
          <div>
            <input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <button onClick={resetPassword}>Reset Password</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;