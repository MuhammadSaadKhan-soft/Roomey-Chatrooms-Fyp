const express = require('express');
const router = express.Router();
const groupModel = require('../models/groupmodel'); 
const app = express();
const http = require('http');
const server = http.createServer(app);

const SocketIO = require('socket.io');

const io = SocketIO(server, {
  cors: {
    origin: "http://localhost:3000", // or your client URL
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  }
});
router.post('/', async (req, res) => {
    try {
        console.log('Incoming request body:', req.body); 
        const { roomId, text, sender } = req.body;
        console.log(req.body)
        if (!roomId || !text || !sender) {
            return res.status(400).json({ error: 'Missing required fields' }); 
        }

        const message = new groupModel({
            roomId,
            text,
            sender
        });
        await message.save();
        console.log('Message saved:', message); 
        res.status(201).json(message);
    } catch (error) {
        console.error('Error sending message:', error); 
        res.status(500).json({ error: 'Server error' });
    }
});
router.get('/:roomId', async (req, res) => {
  try {
      const email = req.params.name;
      const roomId = req.params.roomId;

      const messages = await groupModel.find({ roomId }).populate('sender');
      const sender = messages.find(message => message.sender ===email);

      const responseData = {
          sender,
          messages
      };

      res.status(200).json(responseData);
  } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ error: 'Server error' });
  }
});
router.put('/edit/edit', async (req, res) => {
    try {
        const { messageId, text } = req.body;
        console.log('Received messageId:', messageId);  // Log the messageId
        console.log('Received text:', text);            // Log the text

        if (!messageId || !text) {
            return res.status(400).json({ error: 'Missing required fields: messageId or text' });
        }

        // Update the message in the database
        const updatedMessage = await groupModel.findOneAndUpdate(
            { _id: messageId },
            { text, isEdited: true },
            { new: true, runValidators: true }
        );

        if (!updatedMessage) {
            return res.status(404).json({ error: 'Message not found' });
        }

        console.log('Updated message:', updatedMessage);

        // Emit the updated message to all connected clients via Socket.IO
        io.emit('messageUpdated', updatedMessage);
         
        res.status(200).json(updatedMessage); // Return the updated message as response
    } catch (error) {
        console.error('Error updating message:', error);
        res.status(500).json({ error: 'Server error' });
    }
});







module.exports = router;
