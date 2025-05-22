const TemporaryGroup = require('../models/TemporaryGroup'); // Adjust the path as necessary

const deleteRoom = async (roomId) => {
    try {
        const tempRoom = await TemporaryGroup.findById(roomId);
        if (tempRoom) {
          await TemporaryGroup.findByIdAndDelete(roomId);
          console.log(`✅ Deleted temporary room ${roomId}, messages preserved.`);
          return;
        }
        if (!tempRoom) {
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
