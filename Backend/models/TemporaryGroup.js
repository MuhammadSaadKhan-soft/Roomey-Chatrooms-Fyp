const mongoose = require('mongoose');

const temporaryGroupSchema = new mongoose.Schema({
    name: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        
    },
    profilePicture:{
        type:String
    },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

temporaryGroupSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const TemporaryGroup = mongoose.model('TemporaryGroup', temporaryGroupSchema);

module.exports = TemporaryGroup;
