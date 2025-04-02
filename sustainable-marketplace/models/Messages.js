const mongoose = require("mongoose");

// Define the Message schema
const messageSchema = new mongoose.Schema({
  chat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Chat", // Reference to the Chat model
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User model (sender of the message)
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User model (recipient of the message)
    required: true
  },
  content: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false // Message read status, false by default
  },
  createdAt: {
    type: Date,
    default: Date.now // Timestamp of when the message was created
  }
});

// Create the Message model
const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
