const express = require('express');
const router = express.Router();
const cloudinary = require('../utils/cloudinary');
const upload = require('../middleware/multer');
router.post('/upload', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded",
            });
        }
        
        const result = await cloudinary.uploader.upload(req.file.path);
        return res.status(200).json({
            success: true,
            message: "Image uploaded successfully",
            data: result,
        });
    } catch (error) {
        console.error('Error uploading image:', error);
        return res.status(500).json({
            success: false,
            message: "Error uploading image",
            error: error.message,
        });
    }
});

router.get('/image-url/:publicId', async (req, res) => {
    try {
        const publicId = req.params.publicId;

        // Retrieve the image URL from Cloudinary
        const result = await cloudinary.api.resource(publicId, {});

        // Respond with the image URL
        return res.status(200).json({
            success: true,
            imageUrl: result.secure_url, // Cloudinary provides secure_url
        });
    } catch (error) {
        console.error('Error retrieving image URL:', error);
        return res.status(500).json({
            success: false,
            message: "Error retrieving image URL",
            error: error.message,
        });
    }
});

module.exports = router;
