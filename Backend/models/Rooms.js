const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    
    profilePicture:{
        
        type: String,
    },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        
    }
});

module.exports = mongoose.model('Room', RoomSchema);
