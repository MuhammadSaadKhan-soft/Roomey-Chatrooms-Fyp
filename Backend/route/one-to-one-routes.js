const express = require("express");
const User = require("../models/User");
const OneToOneRoom = require("../models/oneToOne");
const router = express.Router();

// Create a one-to-one chat room
router.post("/rooms/create-one-to-one", async (req, res) => {
  try {
    const { name, adminId, recipientUsername } = req.body

    // Validate inputs
    if (!name || !adminId || !recipientUsername) {
      return res.status(400).json({ message: "Missing required fields" })
    }

    // Find the admin user
    const admin = await User.findById(adminId)
    if (!admin) {
      return res.status(404).json({ message: "Admin user not found" })
    }

    // Find the recipient user by username
    const recipient = await User.findOne({ name: recipientUsername })
    if (!recipient) {
      return res.status(404).json({ message: "Recipient user not found" })
    }

    // Check if a one-to-one room already exists between these users
    const existingRoom = await OneToOneRoom.findOne({
      $or: [
        { admin: adminId, recipient: recipient._id },
        { admin: recipient._id, recipient: adminId },
      ],
    })

    if (existingRoom) {
      return res.status(200).json({
        roomId: existingRoom._id,
        adminName: admin.name,
        message: "One-to-one chat room already exists",
      })
    }

    // Create a new one-to-one room
    const newRoom = new OneToOneRoom({
      name,
      admin: adminId,
      recipient: recipient._id,
      users: [adminId, recipient._id], // Only include the admin and recipient
      isOneToOne: true,
      maxUsers: 2,
    })

    await newRoom.save()

    // Return the room details
    return res.status(201).json({
      roomId: newRoom._id,
      adminName: admin.name,
      recipientName: recipient.name,
      message: "One-to-one chat room created successfully",
    })
  } catch (error) {
    console.error("Error creating one-to-one room:", error)
    return res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get one-to-one room details
router.get("/rooms/one-to-one/:id", async (req, res) => {
  try {
    const roomId = req.params.id
    const room = await OneToOneRoom.findById(roomId).populate("admin").populate("recipient").populate("users")

    if (!room) {
      return res.status(404).json({ message: "Room not found" })
    }

    res.status(200).json(room)
  } catch (error) {
    console.error("Error fetching one-to-one room:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Join a one-to-one room
router.post("/rooms/join/one-to-one", async (req, res) => {
  try {
    const { roomId, userId } = req.body

    const room = await OneToOneRoom.findById(roomId)
    if (!room) {
      return res.status(404).json({ message: "Room not found" })
    }

    // Check if the user is either the admin or the recipient
    if (!room.users.includes(userId)) {
      return res.status(403).json({
        message: "This is a one-to-one chat. Only the designated users can join.",
      })
    }

    res.status(200).json({ message: "Successfully joined the one-to-one room" })
  } catch (error) {
    console.error("Error joining one-to-one room:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

module.exports = router
