const TemporaryGroup = require('../models/TemporaryGroup'); // Adjust the path as necessary

const deleteRoom = async (roomId) => {
    try {
        const result = await TemporaryGroup.findByIdAndDelete(roomId);
        if (!result) {
            throw new Error(`Room with ID ${roomId} not found.`);
        }
        console.log(`Room ${roomId} deleted successfully.`);
    } catch (error) {
        console.error(`Error deleting room ${roomId}:`, error);
    }
};

module.exports = {
    deleteRoom,
};
