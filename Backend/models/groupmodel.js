// models/Message.js
const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        
    },
    messageId:{
        type: mongoose.Schema.Types.ObjectId,
        required:false
    },
  
    text: {
        type: String,
        required:false
    },
    
    sender: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    profilePicture: { type: String },
    audioUrl: { type: String }
});

module.exports = mongoose.model('GroupsChatting', MessageSchema);
