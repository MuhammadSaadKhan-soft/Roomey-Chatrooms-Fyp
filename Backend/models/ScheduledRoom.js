
const mongoose = require('mongoose');

const scheduledRoomSchema = new mongoose.Schema({
    name: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now },
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        
    },
    profilePicture:{
        type:String
    }
    , users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

const ScheduledRoom = mongoose.model('ScheduledRoom', scheduledRoomSchema);

module.exports = ScheduledRoom;
