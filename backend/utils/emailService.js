import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST, // smtp-relay.brevo.com
  port: process.env.SMTP_PORT, // 587
  secure: false, // Use TLS (false for 587)
  auth: {
    user: process.env.EMAIL_USER, // Your Brevo SMTP email
    pass: process.env.EMAIL_PASS, // Your Brevo SMTP password
  },
});

/**
 * Send an email using Brevo SMTP
 * @param {string} recipient - The recipient email
 * @param {string} subject - Email subject
 * @param {string} message - HTML message body
 */
console.log
const sendEmail = async (recipient, subject, message) => {
  try {
    const info = await transporter.sendMail({
      from: `"Event Heaven" <${process.env.EMAIL_USER}>`, // Set sender name
      to: recipient,
      subject: subject,
      html: message,
    });

    console.log(`✅ Email sent to ${recipient} (Message ID: ${info.messageId})`);
  } catch (error) {
    console.error("❌ Error sending email:", error);
  }
};

export default sendEmail;
