const express = require("express")
const router = express.Router() // ✅ Use Router
const nodemailer = require("nodemailer")

// Set up Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
  debug: true, // add this
  logger: true, // and this
})

// Handle form submission
router.post("/send-email", async (req, res) => {
  const { name, email, phone, message } = req.body

  const mailOptions = {
    from: `"Vistora Hotel" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "Thank you for contacting Vistora Hotel",
    text: `Dear ${name},\n\nThank you for your message: ${message}\n\nBest regards,\nVistora Hotel Team`,
  }

  try {
    await transporter.sendMail(mailOptions)
    // Show alert and redirect to home
    res.send(`<script>alert('Email sent'); window.location.href = '/';</script>`)
  } catch (error) {
    console.error(error)
    res.status(500).send("Error sending email.")
  }
})

module.exports = router
