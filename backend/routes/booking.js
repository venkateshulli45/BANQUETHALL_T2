const express = require("express");
const sendEmail = require("../utils/emailService");
const router = express.Router();

router.post("/confirm-booking", async (req, res) => {
  const { hall, userEmail, vendorEmail, bookingDate } = req.body;

  try {
    // Send email to Vendor
    await sendEmail(
      vendorEmail,
      "New Hall Booking Confirmation",
      `<p>Your hall <strong>${hall.name}</strong> has been booked on <strong>${bookingDate}</strong>.</p>`
    );

    // Send email to User
    await sendEmail(
      userEmail,
      "Your Booking Confirmation",
      `<p>Thank you for booking <strong>${hall.name}</strong> on <strong>${bookingDate}</strong>! Your booking is confirmed.</p>`
    );

    res.json({ success: true, message: "Emails sent successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Email sending failed" });
  }
});

module.exports = router;
