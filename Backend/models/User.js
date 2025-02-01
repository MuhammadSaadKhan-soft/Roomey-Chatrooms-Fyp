const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema({
  
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: false,
  },
  resetPasswordCode: {
    type: String,
  },
  resetPasswordCodeExpiry: {
    type: Date,
  },
  profilePicture: {
    type: String,
  },
  bio: {
    type: String,  
  },
  interest: {
    type: [String],  
  },
  date: {
    type: Date,
    default: Date.now,
  },
  blockedGroups: [
    {
      type: Schema.Types.ObjectId,
      ref: 'PrivateGroup', // Adjust 'Group' to match your group model's name
    },
  ],
 
});


module.exports = mongoose.model('User', UserSchema);
