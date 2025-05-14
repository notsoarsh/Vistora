require("dotenv").config()

const express = require("express")
const path = require("path")
const cors = require("cors")
const helmet = require("helmet")
const morgan = require("morgan")
const compression = require("compression")
const cookieParser = require("cookie-parser")
const session = require("express-session")
const mongoose = require("mongoose")
const MongoStore = require("connect-mongo")

const app = express()
const PORT = process.env.PORT || 8080

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/vistora_express")
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err))

// Set EJS as the view engine
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())
app.use(morgan("dev"))
app.use(compression())
app.use(cookieParser())
app.use(express.static(path.join(__dirname, "public")))

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "vistora-secret-key",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI || "mongodb://localhost:27017/vistora_express",
      ttl: 14 * 24 * 60 * 60, // 14 days
    }),
    cookie: {
      maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days in milliseconds
      httpOnly: true,
    },
  }),
)

// Make user data available to all templates
app.use((req, res, next) => {
  res.locals.user = req.session.user || null
  res.locals.isAuthenticated = !!req.session.userId
  next()
})

const sampleData = require("./sample-data")

// Security Middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://cdn.jsdelivr.net", "https://fonts.googleapis.com", "'unsafe-inline'"],
        styleSrc: ["'self'", "https://cdn.jsdelivr.net", "https://fonts.googleapis.com", "'unsafe-inline'"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdn.jsdelivr.net", "data:"],
        imgSrc: ["'self'", "data:", "https://cdn.jsdelivr.net"],
        frameSrc: ["'self'", "https://www.youtube.com", "https://www.youtube-nocookie.com"],
        objectSrc: ["'none'"],
      },
    },
  }),
)

// Custom Middlewares
const logger = require("./middleware/logger")
const errorHandler = require("./middleware/errorHandler")
app.use(logger)

// Define common data for templates
const commonData = {
  logoPath: "/images/vistora.png",
  navLinks: [
    { url: "/", text: "HOME" },
    { url: "/rooms", text: "ROOMS/SUITS" },
    { url: "/spa&wellness", text: "SPA & WELLNESS" },
    { url: "/contact", text: "CONTACT US" },
    { url: "/about", text: "ABOUT US" },
  ],
  // We'll update the buttons dynamically based on auth state
  getButtons: (isAuthenticated) => {
    return isAuthenticated
      ? [
          { url: "/booking", text: "BOOK NOW", class: "me-2" },
          { url: "/api/logout", text: "LOGOUT", class: "" },
        ]
      : [
          { url: "/booking", text: "BOOK NOW", class: "me-2" },
          { url: "/login", text: "LOGIN", class: "" },
        ]
  },
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
        { url: "/dining", text: "Dining" },
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
}

// HTML Page Routes
app.get("/", (req, res) => {
  res.render("index", {
    title: "Vistora",
    ...commonData,
    buttons: commonData.getButtons(!!req.session.userId),
    videoUrl:
      "https://www.youtube.com/embed/H1CIBqDeWQ0?rel=0&controls=0&modestbranding=1&autoplay=1&mute=1&loop=1&playlist=H1CIBqDeWQ0",
    heroTitle: "WHERE HERITAGE MEETS LUXURY",
    heroSubtitle: "Step into a world of elegance, where every moment tells a story and every detail is a masterpiece.",
    firstRowImages: [
      {
        src: "/images/12.jpg",
        alt: "Image 1",
        description: "Relax in our deluxe suite with breathtaking views and unparalleled comfort.",
      },
      {
        src: "/images/13.jpg",
        alt: "Image 2",
        description: "Step into an elegant and luxurious hotel lobby designed to welcome you.",
      },
    ],
    featuresTitle: "Why Choose Us?",
    features: [
      {
        icon: "bi-house-door",
        title: "Luxurious Rooms",
        description: "Stay in the lap of luxury with world-class amenities and breathtaking views.",
      },
      {
        icon: "bi-cup-straw",
        title: "Gourmet Dining",
        description: "Experience culinary excellence with diverse cuisines and exceptional service.",
      },
      {
        icon: "bi-tree",
        title: "Spa & Wellness",
        description: "Rejuvenate your mind and body with our holistic wellness and spa therapies.",
      },
    ],
    secondRowImages: [
      {
        src: "/images/21.jpg",
        alt: "Image 3",
        description: "Indulge in gourmet dining featuring cuisines from around the world.",
      },
      {
        src: "/images/17.jpg",
        alt: "Image 4",
        description: "Rejuvenate your senses with serene spa and wellness treatments.",
      },
      {
        src: "/images/15.jpg",
        alt: "Image 5",
        description: "Dive into our outdoor pool and unwind in the lush surroundings.",
      },
    ],
  })
})

// Login page route
app.get("/login", (req, res) => {
  const message = req.query.message || ""
  res.render("login", {
    title: "Login - Vistora",
    ...commonData,
    buttons: commonData.getButtons(!!req.session.userId),
    message,
    carouselImages: [
      { src: "/images/12.jpg", alt: "Luxury Room" },
      { src: "/images/13.jpg", alt: "Hotel Lobby" },
      { src: "/images/21.jpg", alt: "Dining Experience" },
    ],
  })
})

// Import auth middleware
const authMiddleware = require("./middleware/authMiddleware")

app.get("/booking", authMiddleware, (req, res) => {
  const templateData = {
    ...sampleData,
    ...commonData,
    title: "Book Your Stay | Vistora Hotels",
    buttons: commonData.getButtons(!!req.session.userId),
  }

  res.render("booking", templateData)
})

// Handle form submission
app.post("/check-availability", authMiddleware, (req, res) => {
  const formData = req.body

  // In a real app, you would validate and process the form data here
  // For this example, we'll just send the data back to the template

  res.render("booking", {
    ...sampleData,
    ...commonData,
    formData,
    // You could add a success message here
  })
})

// Newsletter subscription
app.post("/subscribe", (req, res) => {
  // Process newsletter subscription
  // Redirect back to booking page with a success message
  res.redirect("/booking?subscribed=true")
})

app.get("/about", (req, res) => {
  res.render("about", {
    title: "About Us - Vistora",
    ...commonData,
    buttons: commonData.getButtons(!!req.session.userId),
  })
})

app.get("/contact", (req, res) => {
  res.status(200).sendFile(path.join(__dirname, "views", "contactus.html"))
})
// app.get("/contact", (req, res) => {
//   res.render("contactus", {
//     title: "contact Us",
//     ...commonData,
//     buttons: commonData.getButtons(!!req.session.userId),
//   })
// }
// );

// app.get("/events", (req, res) => {
//   res.status(200).sendFile(path.join(__dirname, "views", "Events.html"))
// })
app.get("/events", (req, res) => {
  res.render("Events", {
    title: "Events",
    ...commonData,
    buttons: commonData.getButtons(!!req.session.userId),
  })
}
);

app.get("/rooms", (req, res) => {
  res.render("Hotels", {
    title: "Rooms",
    ...commonData,
    buttons: commonData.getButtons(!!req.session.userId),
  })
})

app.get("/payment", authMiddleware, (req, res) => {
  res.render("Payment", { title: "Payment", ...commonData })
})

app.get("/spa&wellness", (req, res) => {
  res.render("SpaAndWellness", {
    title: "Spa",
    ...commonData,
    buttons: commonData.getButtons(!!req.session.userId),
  })
})

// API Routes
const apiRoutes = require("./api/apiRoutes")
app.use("/api", apiRoutes)

// Booking Routes
const bookingRoutes = require("./routes/bookingRoutes")
app.use("/", bookingRoutes)

// 404 Handler (after all other routes)
app.use((req, res) => {
  res.status(404).json({ error: "Page not found" })
})

// Error Handling Middleware (last)
app.use(errorHandler)

// Start server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`)
})
