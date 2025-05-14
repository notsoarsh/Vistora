const mongoose = require("mongoose")
const Schema = mongoose.Schema

// Define the User schema
const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    default: function () {
      return `${this.username}@example.com`
    },
  },
  phone: {
    type: String,
    default: "+1 800 123 4567",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Create and export the User model
const User = mongoose.model("User", userSchema)
module.exports = User
