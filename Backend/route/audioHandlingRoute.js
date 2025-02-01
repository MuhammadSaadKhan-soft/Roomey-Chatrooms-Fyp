const multer = require('multer');
const path = require('path');
const express = require('express');
const fs = require('fs');
const router = express.Router();
const groupModel = require('../models/groupmodel'); // Adjust the path to your model file

// Ensure the upload directory exists
const uploadDir = 'uploads/audio';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); // Save audio files in this directory
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Create unique file names
    }
});

const upload = multer({ storage });

router.post('/', upload.single('audio'), async (req, res) => {
    try {
        const { roomId, sender,profilePicture } = req.body;
        console.log('Request body:', req.body); // Check request body
        console.log('Request file:', req.file);   // Check uploaded file
       
        if (!roomId || !sender || typeof roomId !== 'string' || typeof sender !== 'string') {
            return res.status(400).json({ error: 'Invalid roomId or sender format' });
        }
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded.' });
        }
        if (!/^[0-9a-fA-F]{24}$/.test(roomId)) {
            return res.status(400).json({ error: 'Invalid roomId format' });
        }

        console.log('File uploaded:', req.file);

        const audioUrl = `http://localhost:5000/uploads/audio/${req.file.filename}`;

        console.log(audioUrl);
        const message = new groupModel({
            roomId,
         
            sender,
            audioUrl,
            profilePicture
        });

        await message.save();
        res.status(201).json({ message, audioUrl });
    } catch (error) {
        console.error('Error saving message:', error);
        res.status(500).json({ error: 'Server error' });
    }
});


module.exports = router;
