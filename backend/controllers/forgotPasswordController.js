import otpGenerator from "otp-generator";
import bcrypt from "bcryptjs"; // Import bcryptjs for password hashing
import dotenv from "dotenv";
import { sendEmail } from "../config/mailer.js";
import { db } from "../config/db.js";

dotenv.config();

const otpStore = new Map(); // Temporary OTP storage (Consider storing in DB for production)

// Helper function for MySQL Queries
const queryDB = (sql, values) => {
    return new Promise((resolve, reject) => {
        db.query(sql, values, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
};

// Generate & Send OTP
export const sendOTP = async (req, res) => {
    const { email } = req.body;

    // Check if email is provided
    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    // Query the database for the user
    db.query("SELECT * FROM users WHERE email=?", [email], async (err, results) => {
        if (err) {
            console.error("Database query error:", err);
            return res.status(500).json({ message: "Server error" });
        }

        // Check if user exists
        if (results.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        // Generate OTP
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        console.log(`Generated OTP: ${otp}`);

        // Store OTP in the temporary storage
        otpStore.set(email, { otp, expiresAt: Date.now() + 5 * 60 * 1000 }); // OTP expires in 5 minutes

        try {
            // Send OTP email
            const emailResponse = await sendEmail(email, otp);
            if (emailResponse.success) {
                console.log("OTP email sent successfully");
                return res.json({ success: true, message: "OTP sent successfully" });
            } else {
                return res.status(500).json({ message: "Failed to send OTP", error: emailResponse });
            }
        } catch (error) {
            console.error("Error sending OTP email:", error);
            return res.status(500).json({ message: "Failed to send OTP" });
        }
    });
};


// Verify OTP
export const verifyOTP = (req, res) => {
    const { email, otp } = req.body;

    if (!otpStore.has(email)) {
        return res.status(400).json({ message: "No OTP found. Request a new one." });
    }

    const storedOtp = otpStore.get(email);

    if (Date.now() > storedOtp.expiresAt) {
        otpStore.delete(email);
        return res.status(400).json({ message: "OTP expired. Request a new one." });
    }

    if (storedOtp.otp !== otp) {
        return res.status(400).json({ message: "Invalid OTP. Try again." });
    }

    otpStore.delete(email);
    res.json({ message: "OTP verified successfully!" });
};

// Reset Password
export const resetPassword = (req, res) => {
    const { email, newPassword } = req.body;

    // Query user from database
    db.query("SELECT * FROM users WHERE email=?", [email], (err, results) => {
        if (err) {
            console.error("Error fetching user:", err);
            return res.status(500).json({ message: "Server error" });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const user = results[0];

        // Hash new password
        bcrypt.hash(newPassword, 10, (hashErr, hashedPassword) => {
            if (hashErr) {
                console.error("Error hashing password:", hashErr);
                return res.status(500).json({ message: "Error processing password" });
            }

            // Update password in database
            db.query("UPDATE users SET password=? WHERE email=?", [hashedPassword, email], (updateErr, updateResult) => {
                if (updateErr) {
                    console.error("Error updating password:", updateErr);
                    return res.status(500).json({ message: "Error updating password" });
                }

                res.json({ message: "Password reset successful!" });
            });
        });
    });
};

