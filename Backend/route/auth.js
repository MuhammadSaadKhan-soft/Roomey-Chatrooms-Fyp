const express = require('express');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const fetchuser = require('../middleware/fetchuseer');
const router = express.Router();
const app=express();
const nodemailer = require('nodemailer');
const cloudinary = require('../utils/cloudinary');
const upload = require('../middleware/multer');
const { uploadImage } = require('../utils/uploadImage'); 
app.set('view engine', 'ejs');
app.use(express.json())
app.use(express.urlencoded({extended:false}))
// Function to generate JWT token
const JWT_SECRET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const client = new OAuth2Client('1069042857649-7is2jss14ja3at30vh863ebtcp5ddio0.apps.googleusercontent.com');

const generateToken = (userId) => {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h' }); // Set token expiration to 1 hour
};
const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' }); // Refresh token valid for 7 days
};
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401); // if there isn't any token

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403); //if the token is not valid for the user
        req.user = user;
        next();
    });
};
 
router.post('/createUser', upload.single('profilePicture'), async (req, res) => {
  const { name, email, password,interest } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, message: 'This Email already exists' });
    }

    const salt = await bcryptjs.genSalt(10);
    const secPass = await bcryptjs.hash(password, salt);

    let profilePictureUrl = '';
    if (req.file) {
      profilePictureUrl = await uploadImage(req.file);
    }

    user = new User({
      name,
      email,
      password: secPass,
      profilePicture: profilePictureUrl,
      
      interest
    });

    await user.save();

    const data = {
      user: {
        id: user.id,
      },
    };

    const jwtSecret = JWT_SECRET;
    const token = jwt.sign(data, jwtSecret);

    res.json({ success: true, token, user: { id: user.id, name: user.name, email: user.email, profilePicture: user.profilePicture,interest:user.interest } });
  } catch (error) {
    console.error('Error creating user:', error.message);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});


// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('Login request:', { email, password });
  
  try {
      // Check if user exists
      let user = await User.findOne({ email });
      if (!user) {
          return res.status(400).json({ error: "Invalid credentials" });
      }
      console.log('user',user);
      // Validate password
      console.log('Password provided:', password);
      console.log('Stored hash:', user.password);
      const isPasswordMatch = await bcryptjs.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({ error: "Invalid credentials" });
        }
    
     // user.password=undefined;
      // Generate token
      const token = generateToken(user.id);
      const refreshToken = generateRefreshToken(user.id);
      res.cookie('jwt', token, { maxAge: 15 * 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'strict' });
      res.cookie('refreshToken', refreshToken, { maxAge: 7 * 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'strict' });
      res.json({ token, refreshToken, user });
  } catch (error) {
      console.error("Error logging in:", error);
      res.status(500).json({ error: "Server error" });
  }
});



router.get('/profile', fetchuser, async (req, res) => {
  try {
      console.log('User ID from request:', req.user.id); // Add logging
      const user = await User.findById(req.user.id).select('-password');
      if (!user) {
          return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
  } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: 'Server error' });
  }
});





router.patch('/updateuser', fetchuser, upload.single('profilePicture'), async (req, res) => {
  try {
      const userId = req.user.id;
      const { name, email, password, bio, interest } = req.body;
      const updateFields = {};

      if (name) updateFields.name = name;
      if (email) updateFields.email = email;
      if (password) {
          const salt = await bcryptjs.genSalt(10);
          updateFields.password = await bcryptjs.hash(password, salt);
      }
      if (bio) updateFields.bio = bio;
      if (interest) updateFields.interest = interest;

      if (req.file) {
          const result = await cloudinary.uploader.upload(req.file.path);
          updateFields.profilePicture = result.secure_url;
      }

      const updatedUser = await User.findByIdAndUpdate(
          userId,
          { $set: updateFields },
          { new: true }
      ).select('-password');
      // req.app.get('io').emit('usernameUpdated', { userId, name: updatedUser.name });
      const token = generateToken(userId);
      res.cookie('jwt', token, {
          maxAge: 15 * 24 * 60 * 60 * 1000,
          httpOnly: true,
          sameSite: 'strict',
      });

      res.json({ token, user: updatedUser });
  } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ error: "Server error", details: error.message });
  }
});






// Create a nodemailer transporter using SMTP transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host:'smtp.gmail.com',
  port: 587,
  auth: {
    user: 'saadhussaini678@gmail.com', // Your Gmail email address
    pass: 'rtvikshxrtsdjdsf', // Your Gmail password
  },
});

router.post('/forget-password', async (req, res) => {
    const { email } = req.body;
    try {
        const oldUser = await User.findOne({ email });
        if (!oldUser) {
            return res.json({ status: 'user not found' });
        }
        const code = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a random 6-digit number
        oldUser.resetPasswordCode = code; // Save the code in the user document
        oldUser.resetPasswordCodeExpiry = Date.now() + 15 * 60 * 1000; // Set code expiry to 15 mins from now
        await oldUser.save();

        const mailOptions = {
          from: 'noreply@roomey.com',
          to: email,
          subject: 'Password Reset Code',
          html: `
              <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #f9f9f9; max-width: 600px; margin: 0 auto;">
                  <div style="text-align: center; margin-bottom: 20px;">
                      <img src="https://img.freepik.com/premium-photo/diverse-group-friends-casually-chatting-couch_1282444-263137.jpg" alt="Roomey Logo" style="width: 120px; border-radius: 10px;">
                  </div>
                  <h1 style="color: #4CAF50; font-size: 28px; text-align: center; margin-bottom: 10px;">Roomey Chat</h1>
                  <h2 style="color: #333; font-size: 22px; text-align: center; margin-bottom: 20px;">Password Reset Request</h2>
                  <p style="color: #555; line-height: 1.6; margin-bottom: 15px;">
                      Dear User,
                  </p>
                  <p style="color: #555; line-height: 1.6; margin-bottom: 15px;">
                      You have requested a password reset. Please use the following code to reset your password:
                  </p>
                  <div style="text-align: center; margin: 20px 0;">
                      <span style="display: inline-block; padding: 10px 20px; font-size: 24px; color: #ffffff; background-color: #4CAF50; border-radius: 5px;">${code}</span>
                  </div>
                  <p style="color: #555; line-height: 1.6; margin-bottom: 15px;">
                      This code will expire in 15 minutes.
                  </p>
                  <p style="color: #555; line-height: 1.6; margin-bottom: 15px;">
                      If you did not request a password reset, please ignore this email.
                  </p>
                  <p style="color: #555; line-height: 1.6; margin-bottom: 15px;">
                      Thank you!
                  </p>
                  <p style="font-size: 12px; color: #aaa; line-height: 1.6; text-align: center;">
                      This is an automated message, please do not reply.
                  </p>
              </div>
          `,
      };
      

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error('Error sending email:', error);
            res.status(500).json({ status: 'error', message: 'An unexpected error occurred while sending email' });
          } else {
            console.log('Email sent:', info.response);
            res.json({ status: 'success', message: 'Reset code sent to your email' });
          }
        });
    } catch (error) {
        console.error('Error generating reset code:', error);
        res.status(500).json({ status: 'error', message: 'An unexpected error occurred' });
    }
});

router.post('/reset-password', async (req, res) => {
    const { email, code, newPassword } = req.body;

    const oldUser = await User.findOne({ email });
    if (!oldUser) {
      return res.json({ status: "User not exist" });
    }

    // Validate code
    if (oldUser.resetPasswordCode !== code) {
      return res.status(401).json({ status: "Invalid Code" });
    }

    // Check for code expiry
    const codeExpiry = oldUser.resetPasswordCodeExpiry;
    if (codeExpiry < Date.now()) {
      return res.status(401).json({ status: "Expired code" });
    }

    // Hash the new password
    const salt = await bcryptjs.genSalt(10);
    const hashedNewPassword = await bcryptjs.hash(newPassword, salt);

    // Update the user's password
    oldUser.password = hashedNewPassword;
    oldUser.resetPasswordCode = undefined;
    oldUser.resetPasswordCodeExpiry = undefined;
    await oldUser.save();

    try {
      res.json({ status: 'success', message: 'Password reset successful' });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Server error" });
    }
});

router.post('/google-login', async (req, res) => {
    const { token: googleToken } = req.body;

    try {
        // Verify the token
        const ticket = await client.verifyIdToken({
            idToken: googleToken,
            audience: '1069042857649-7is2jss14ja3at30vh863ebtcp5ddio0.apps.googleusercontent.com',
        });

        const payload = ticket.getPayload();
        const { email, name } = payload;

        // Check if user already exists in your database
        let user = await User.findOne({ email });

        if (!user) {
            // Create a new user if not exists
            user = new User({ email, name });
            await user.save();
        }

        // Generate token (e.g., JWT)
        const token = generateToken(user.id);

        res.json({ token, user });
    } catch (error) {
        console.error('Error verifying Google token:', error.stack);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
