import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

export const sendEmail = async (email, otp) => {
    try {
        console.log("Using Brevo API Key:", process.env.BREVO_API_KEY ? "✅ Loaded" : "❌ Not Loaded");
        console.log("Sending OTP to:", email);

        const response = await axios.post(
            "https://api.brevo.com/v3/smtp/email",
            {
                sender: { name: "EventHeaven", email: "eventheavenn@gmail.com" }, // Must be verified in Brevo
                to: [{ email: email }],
                subject: "Your OTP Code",
                htmlContent: `<p>Your OTP code is <strong>${otp}</strong>. It is valid for 5 minutes.</p>`,
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "api-key": process.env.BREVO_API_KEY,
                },
            }
        );

        console.log("Brevo Response:", response.data);
        return { success: true, message: "Email sent successfully", data: response.data };
    } catch (error) {
        console.error("Brevo API Error:", error.response?.data || error.message);
        return { success: false, message: "Error sending email", error: error.response?.data || error.message };
    }
};
/**
 * Send an email using Brevo SMTP
 * @param {string} recipient - The recipient email
 * @param {string} subject - Email subject
 * @param {string} message - HTML message body
 */
export const sendEmailConfirmation = async (email, subject, message) => {
    try {
        console.log("Using Brevo API Key:", process.env.BREVO_API_KEY ? "✅ Loaded" : "❌ Not Loaded");
        console.log("Sending mail", email);

        const response = await axios.post(
            "https://api.brevo.com/v3/smtp/email",
            {
                sender: { name: "EventHeaven", email: "eventheavenn@gmail.com" }, // Must be verified in Brevo
                to: [{ email: email }],
                subject: subject,
                htmlContent: message,
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "api-key": process.env.BREVO_API_KEY,
                },
            }
        );

        console.log("Brevo Response:", response.data);
        return { success: true, message: "Email sent successfully", data: response.data };
    } catch (error) {
        console.error("Brevo API Error:", error.response?.data || error.message);
        return { success: false, message: "Error sending email", error: error.response?.data || error.message };
    }
};
