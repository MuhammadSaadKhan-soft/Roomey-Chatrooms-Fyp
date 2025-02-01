// utils/imageUtils.js
const cloudinary = require('./cloudinary');

const uploadImage = async (file) => {
    if (!file) {
        return '';
    }

    try {
        const result = await cloudinary.uploader.upload(file.path);
        return result.secure_url;
    } catch (error) {
        console.error('Error uploading image:', error);
        throw new Error('Error uploading image');
    }
};

module.exports = { uploadImage };
