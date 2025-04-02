import otpGenerator from "otp-generator";
import dotenv from "dotenv";
import { sendEmail } from "../config/mailer.js";
import { db } from '../config/db.js';

dotenv.config();

const otpStore = new Map(); // Temporary OTP storage

// User Signup
export const sendOTP = async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    try {
        // Check if the user **already exists**
        const [existingUser] = await db.promise().query("SELECT * FROM users WHERE email = ?", [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Generate and store OTP
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        otpStore.set(email, { otp, expiresAt: Date.now() + 5 * 60 * 1000 }); // Expires in 5 min
        console.log(`Generated OTP for Signup: ${otp}`);

        // Send OTP email via Brevo API
        const emailResponse = await sendEmail(email, otp);
        if (!emailResponse.success) {
            return res.status(500).json({ message: "Failed to send OTP", error: emailResponse });
        }

        return res.json({ success: true, message: "OTP sent successfully" });

    } catch (error) {
        console.error("Error sending OTP:", error.message);
        return res.status(500).json({ success: false, message: "Server error", error: error.message });
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
