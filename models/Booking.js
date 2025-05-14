const mongoose = require("mongoose")
const Schema = mongoose.Schema

// Define the Booking schema
const bookingSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  hotelName: {
    type: String,
    required: true,
  },
  roomType: {
    type: String,
    required: true,
  },
  checkIn: {
    type: Date,
    required: true,
  },
  checkOut: {
    type: Date,
    required: true,
  },
  guests: {
    adults: {
      type: Number,
      default: 1,
    },
    children: {
      type: Number,
      default: 0,
    },
  },
  rooms: {
    type: Number,
    default: 1,
  },
  status: {
    type: String,
    enum: ["Confirmed", "Pending", "Cancelled", "Completed"],
    default: "Confirmed",
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  specialRequests: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Create and export the Booking model
const Booking = mongoose.model("Booking", bookingSchema)
module.exports = Booking
