const mongoose = require("mongoose")

const oneToOneRoomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  isOneToOne: {
    type: Boolean,
    default: true,
  },
  maxUsers: {
    type: Number,
    default: 2,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model("OneToOneRoom", oneToOneRoomSchema)
