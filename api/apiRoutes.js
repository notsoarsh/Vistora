const express = require("express")
const path = require("path")
const router = express.Router()
const User = require("../models/User")
const Booking = require("../models/Booking")

// Login route
router.post("/login", async (req, res) => {
  const { username, password } = req.body

  try {
    // Find user in the database
    const user = await User.findOne({ username, password })

    if (user) {
      // Set session data
      req.session.userId = user._id
      req.session.user = {
        name: user.username,
        email: user.email,
        phone: user.phone,
      }

      // Fetch user's bookings
      const bookings = await Booking.find({ userId: user._id }).sort({ createdAt: -1 })

      // Fetch available rooms
      const rooms = [
        {
          name: "Standard Room",
          image: "/images/18.jpg",
          description: "Comfortable and cozy room.",
          detailsUrl: "/room-details",
        },
        {
          name: "Deluxe Suite",
          image: "/images/6.jpg",
          description: "A luxurious suite with ocean views.",
          detailsUrl: "/room-details",
        },
        {
          name: "Presidential Suite",
          image: "/images/5.jpg",
          description: "A spacious suite with premium amenities.",
          detailsUrl: "/room-details",
        },
      ]

      // Render dashboard with user data and bookings
      return res.status(200).render("dashboard", {
        title: "User Dashboard - Vistora",
        logoPath: "/images/vistora.png",
        navLinks: [
          { url: "/", text: "HOME" },
          { url: "/rooms", text: "ROOMS/SUITS" },
          { url: "/spa&wellness", text: "SPA & WELLNESS" },
          { url: "/contact", text: "CONTACT US" },
          { url: "/about", text: "ABOUT US" },
        ],
        buttons: [
          { url: "/booking", text: "BOOK NOW", class: "me-2" },
          { url: "/api/logout", text: "LOGOUT", class: "" },
        ],
        user: {
          name: user.username,
          email: user.email,
          phone: user.phone,
        },
        bookings,
        rooms,
        footerSections: [
          {
            title: "About Vistora",
            type: "text",
            content: "Experience luxury and comfort in the heart of the city at Vistora Hotels.",
          },
          {
            title: "Quick Links",
            type: "links",
            links: [
              { url: "/", text: "Home" },
              { url: "/rooms", text: "Rooms & Suites" },
              { url: "/spa&wellness", text: "Spa & Wellness" },
            ],
          },
          {
            title: "Contact",
            type: "contact",
            items: ["Email: support@vistora.com", "Phone: +1 800 987 6543"],
          },
          {
            title: "Follow Us",
            type: "social",
            icons: [
              { url: "#", class: "bi-facebook" },
              { url: "#", class: "bi-twitter" },
              { url: "#", class: "bi-instagram" },
            ],
          },
        ],
        currentYear: new Date().getFullYear(),
        companyName: "Vistora",
        footerLinks: [
          { url: "#", text: "Privacy Policy" },
          { url: "#", text: "Terms of Use" },
        ],
      })
    } else {
      return res.status(302).redirect("/api/register")
    }
  } catch (error) {
    console.error("Login error:", error)
    return res.status(500).render("login", {
      title: "Login - Vistora",
      error: "An error occurred during login. Please try again.",
      carouselImages: [
        { src: "/images/12.jpg", alt: "Luxury Room" },
        { src: "/images/13.jpg", alt: "Hotel Lobby" },
        { src: "/images/21.jpg", alt: "Dining Experience" },
      ],
    })
  }
})

// Register route - serve the register page
router.get("/register", (req, res) => {
  res.render("register", {
    title: "Register - Vistora",
    logoPath: "/images/vistora.png",
    navLinks: [
      { url: "/", text: "HOME" },
      { url: "/rooms", text: "ROOMS/SUITS" },
      { url: "/spa&wellness", text: "SPA & WELLNESS" },
      { url: "/contact", text: "CONTACT US" },
      { url: "/about", text: "ABOUT US" },
    ],
    buttons: req.session.userId
      ? [
          { url: "/booking", text: "BOOK NOW", class: "me-2" },
          { url: "/api/logout", text: "LOGOUT", class: "" },
        ]
      : [
          { url: "/booking", text: "BOOK NOW", class: "me-2" },
          { url: "/login", text: "LOGIN", class: "" },
        ],
    footerSections: [
      {
        title: "About Vistora",
        type: "text",
        content: "Experience luxury and comfort in the heart of the city at Vistora Hotels.",
      },
      {
        title: "Quick Links",
        type: "links",
        links: [
          { url: "/", text: "Home" },
          { url: "/rooms", text: "Rooms & Suites" },
          { url: "/spa&wellness", text: "Spa & Wellness" },
        ],
      },
      {
        title: "Contact",
        type: "contact",
        items: ["Email: support@vistora.com", "Phone: +1 800 987 6543"],
      },
    ],
  })
})

// Handle user registration
router.post("/register", async (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required." })
  }

  try {
    // Check if the username already exists
    const existingUser = await User.findOne({ username })
    if (existingUser) {
      return res.status(400).json({ error: "Username already exists." })
    }

    // Create a new user
    const newUser = new User({
      username,
      password,
      email: `${username}@example.com`,
      phone: "+1 800 123 4567",
    })

    // Save the user to the database
    await newUser.save()

    // Redirect to the login page with success message
    return res.send(`
      <script>
        alert("Data Saved. Redirecting to Login.");
        window.location.href = "/login";
      </script>
    `)
  } catch (error) {
    console.error("Registration error:", error)
    res.status(500).json({ error: "Internal server error." })
  }
})

// Logout route
router.get("/logout", (req, res) => {
  // Clear the session
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err)
      return res.status(500).send("Error logging out")
    }
    res.redirect("/login")
  })
})

// Dashboard route
router.get("/dashboard", async (req, res) => {
  if (!req.session.userId) {
    return res.redirect("/login")
  }

  try {
    // Fetch user data
    const user = await User.findById(req.session.userId)
    if (!user) {
      req.session.destroy()
      return res.redirect("/login")
    }

    // Fetch user's bookings
    const bookings = await Booking.find({ userId: user._id }).sort({ createdAt: -1 })

    // Render dashboard with user data and bookings
    res.render("dashboard", {
      title: "User Dashboard - Vistora",
      logoPath: "/images/vistora.png",
      navLinks: [
        { url: "/", text: "HOME" },
        { url: "/rooms", text: "ROOMS/SUITS" },
        { url: "/spa&wellness", text: "SPA & WELLNESS" },
        { url: "/contact", text: "CONTACT US" },
        { url: "/about", text: "ABOUT US" },
      ],
      buttons: [
        { url: "/booking", text: "BOOK NOW", class: "me-2" },
        { url: "/api/logout", text: "LOGOUT", class: "" },
      ],
      user: {
        name: user.username,
        email: user.email,
        phone: user.phone,
      },
      bookings,
      rooms: [
        {
          name: "Standard Room",
          image: "/images/18.jpg",
          description: "Comfortable and cozy room.",
          detailsUrl: "/room-details",
        },
        {
          name: "Deluxe Suite",
          image: "/images/6.jpg",
          description: "A luxurious suite with ocean views.",
          detailsUrl: "/room-details",
        },
        {
          name: "Presidential Suite",
          image: "/images/5.jpg",
          description: "A spacious suite with premium amenities.",
          detailsUrl: "/room-details",
        },
      ],
      footerSections: [
        {
          title: "About Vistora",
          type: "text",
          content: "Experience luxury and comfort in the heart of the city at Vistora Hotels.",
        },
        {
          title: "Quick Links",
          type: "links",
          links: [
            { url: "/", text: "Home" },
            { url: "/rooms", text: "Rooms & Suites" },
            { url: "/spa&wellness", text: "Spa & Wellness" },
          ],
        },
        {
          title: "Contact",
          type: "contact",
          items: ["Email: support@vistora.com", "Phone: +1 800 987 6543"],
        },
        {
          title: "Follow Us",
          type: "social",
          icons: [
            { url: "#", class: "bi-facebook" },
            { url: "#", class: "bi-twitter" },
            { url: "#", class: "bi-instagram" },
          ],
        },
      ],
      currentYear: new Date().getFullYear(),
      companyName: "Vistora",
      footerLinks: [
        { url: "#", text: "Privacy Policy" },
        { url: "#", text: "Terms of Use" },
      ],
    })
  } catch (error) {
    console.error("Dashboard error:", error)
    res.status(500).send("Error loading dashboard")
  }
})

module.exports = router
