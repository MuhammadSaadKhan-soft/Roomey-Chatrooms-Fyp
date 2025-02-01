const mongoose = require('mongoose');

const PrivateGroupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    isPrivate: {
        type: Boolean,
        default: true,
    },
    password: {
        type: String,
        required: function() { return this.isPrivate; },
    },
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        
    },

    profilePicture:{
       type:String
    },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
    
});

const PrivateGroup = mongoose.model('PrivateGroup', PrivateGroupSchema);

module.exports = PrivateGroup;
