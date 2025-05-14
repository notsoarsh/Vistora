const express = require("express")
const router = express.Router()
const authMiddleware = require("../middleware/authMiddleware")
const Booking = require("../models/Booking")

// Protect the booking page route
router.get("/booking", authMiddleware, (req, res) => {
  // Render the booking page with user data
  res.render("booking", {
    title: "Book Your Stay | Vistora Hotels",
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
    today: new Date().toISOString().split("T")[0],
    tomorrow: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split("T")[0],
    guestOptions: [
      { value: "1a0c1r", label: "1 Adult, 0 Children - 1 Room" },
      { value: "2a0c1r", label: "2 Adults, 0 Children - 1 Room" },
      { value: "2a1c1r", label: "2 Adults, 1 Child - 1 Room" },
      { value: "2a2c1r", label: "2 Adults, 2 Children - 1 Room" },
      { value: "3a0c1r", label: "3 Adults, 0 Children - 1 Room" },
      { value: "4a0c2r", label: "4 Adults, 0 Children - 2 Rooms" },
    ],
    specialCodes: [
      { value: "promo", label: "Promo Code" },
      { value: "corporate", label: "Corporate Code" },
      { value: "member", label: "Member Discount" },
      { value: "group", label: "Group Booking" },
    ],
    footerLinks: {
      quickLinks: [
        { label: "Home", url: "/" },
        { label: "Rooms & Suites", url: "/rooms" },
        { label: "Spa & Wellness", url: "/spa" },
        { label: "Events", url: "/events" },
        { label: "Gallery", url: "/gallery" },
      ],
      legal: [
        { label: "Privacy Policy", url: "/privacy" },
        { label: "Terms of Use", url: "/terms" },
        { label: "Cookie Policy", url: "/cookies" },
      ],
    },
    contactInfo: {
      email: "support@vistora.com",
      phone: "+1 800 987 6543",
      address: "123 Luxury Avenue, New York, NY 10001",
    },
    user: req.session.user,
  })
})

// Handle booking submission
router.post("/create-booking", authMiddleware, async (req, res) => {
  try {
    const { hotelName, roomType, checkIn, checkOut, adults, children, rooms, specialRequests } = req.body

    // Calculate a random price between $100 and $500 per night
    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24))
    const pricePerNight = Math.floor(Math.random() * 400) + 100
    const totalPrice = pricePerNight * nights * rooms

    // Create a new booking
    const newBooking = new Booking({
      userId: req.session.userId,
      hotelName: hotelName || "Vistora Hotel",
      roomType: roomType || "Standard Room",
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests: {
        adults: adults || 1,
        children: children || 0,
      },
      rooms: rooms || 1,
      status: "Confirmed",
      totalPrice,
      specialRequests: specialRequests || "",
    })

    // Save the booking to the database
    await newBooking.save()

    // Redirect to the dashboard
    res.redirect("/api/dashboard")
  } catch (error) {
    console.error("Booking creation error:", error)
    res.status(500).send("Error creating booking")
  }
})

// Update booking
router.post("/update-booking/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const { status, hotelName, roomType, checkIn, checkOut, adults, children, rooms, specialRequests } = req.body

    // Find the booking and update its status
    const booking = await Booking.findById(id)

    // Check if the booking belongs to the logged-in user
    if (booking.userId.toString() !== req.session.userId) {
      return res.status(403).json({ error: "Unauthorized" })
    }

    // Update the booking with all the new details
    booking.status = status

    // Only update fields that were provided
    if (hotelName) booking.hotelName = hotelName
    if (roomType) booking.roomType = roomType
    if (checkIn) booking.checkIn = new Date(checkIn)
    if (checkOut) booking.checkOut = new Date(checkOut)

    if (adults || children) {
      booking.guests = {
        adults: adults || booking.guests.adults,
        children: children || booking.guests.children,
      }
    }

    if (rooms) booking.rooms = rooms
    if (specialRequests !== undefined) booking.specialRequests = specialRequests

    // Recalculate price if dates or rooms changed
    if ((checkIn && checkOut) || rooms) {
      const checkInDate = checkIn ? new Date(checkIn) : booking.checkIn
      const checkOutDate = checkOut ? new Date(checkOut) : booking.checkOut
      const roomCount = rooms || booking.rooms

      const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24))
      const pricePerNight = Math.floor(Math.random() * 400) + 100
      booking.totalPrice = pricePerNight * nights * roomCount
    }

    await booking.save()

    // Redirect to the dashboard
    res.redirect("/api/dashboard")
  } catch (error) {
    console.error("Booking update error:", error)
    res.status(500).send("Error updating booking")
  }
})

// Cancel booking
router.post("/cancel-booking/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params

    // Find the booking
    const booking = await Booking.findById(id)

    // Check if the booking belongs to the logged-in user
    if (booking.userId.toString() !== req.session.userId) {
      return res.status(403).json({ error: "Unauthorized" })
    }

    // Update the booking status to Cancelled
    booking.status = "Cancelled"
    await booking.save()

    // Redirect to the dashboard
    res.redirect("/api/dashboard")
  } catch (error) {
    console.error("Booking cancellation error:", error)
    res.status(500).send("Error cancelling booking")
  }
})

// Delete booking
router.post("/delete-booking/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params

    // Find the booking
    const booking = await Booking.findById(id)

    // Check if the booking belongs to the logged-in user
    if (booking.userId.toString() !== req.session.userId) {
      return res.status(403).json({ error: "Unauthorized" })
    }

    // Update the booking status to Cancelled instead of deleting
    booking.status = "Cancelled"
    await booking.save()

    // Redirect to the dashboard
    res.redirect("/api/dashboard")
  } catch (error) {
    console.error("Booking cancellation error:", error)
    res.status(500).send("Error cancelling booking")
  }
})

module.exports = router
