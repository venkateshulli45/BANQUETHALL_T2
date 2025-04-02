import otpGenerator from "otp-generator";
import dotenv from "dotenv";
import { sendEmail } from "../config/mailer.js";
import { db } from '../config/db.js';

dotenv.config();

const otpStore = new Map(); // Temporary OTP storage

// User Signup
export const sendOTP = async (req, res) => {
    const { email} = req.body;
    if (!email) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    try {
        // Check if user already exists
        const [existingUser] = await db.promise().query("SELECT * FROM business WHERE email = ?", [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: "User already exists" });
        }
        // Send OTP to the new user
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        otpStore.set(email, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });
        console.log("otp : ",otp) // OTP expires in 5 minutes
        // Send email via Brevo API
        const emailResponse = await sendEmail(email, otp);
        if (emailResponse.success) {
            console.log("OTP email sent successfully");
            return res.json({ success: true, message: "OTP sent successfully" });
        } else {
            return res.status(500).json(emailResponse);
        }
    } catch (error) {
        console.error("Error sending OTP:", error.response?.data || error.message);
        return res.status(500).json({ success: false, message: "Error sending OTP", error: error.message });
    }
};

// Verify OTP
export const verifyOTP = async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: "Email and OTP are required" });

    const storedOTP = otpStore.get(email);
    if (!storedOTP) return res.status(400).json({ message: "OTP not found or expired" });

    if (Date.now() > storedOTP.expiresAt) {
        otpStore.delete(email);
        return res.status(400).json({ message: "OTP expired" });
    }

    if (storedOTP.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });

    otpStore.delete(email); // Remove OTP after successful verification
    return res.json({ success: true, message: "OTP verified successfully" });
};
