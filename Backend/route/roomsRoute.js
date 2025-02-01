const express = require('express');
const Room = require('../models/Rooms');
const groupModal = require("../models/groupmodel");
const PrivateGroup = require('../models/PrivateGroup');
const TemporaryGroup=require('../models/TemporaryGroup');
const ScheduledRoom=require('../models/ScheduledRoom');
const User=require('../models/User');
const router = express.Router();
const cron = require('node-cron');
const { deleteRoom } = require('./roomcontroller'); // Adjust the path as necessary
const nodemailer = require('nodemailer');

// Schedule the task to run every minute
cron.schedule('* * * * *', async () => {
    try {
        const currentTime = new Date();
        const expiredRooms = await TemporaryGroup.find({ expiresAt: { $lt: currentTime } });

        for (const room of expiredRooms) {
            await deleteRoom(room._id); // Use the method from your controller to delete the room
        }
    } catch (error) {
        console.error('Error checking for expired rooms:', error);
    }
});
cron.schedule('* * * * *', async () => {
    try {
        const currentTime = new Date();
        const expiredRooms = await ScheduledRoom.find({ endDate: { $lte: currentTime } });

        if (expiredRooms.length > 0) {
            await ScheduledRoom.deleteMany({ endDate: { $lte: currentTime } });
            console.log(`Deleted ${expiredRooms.length} expired rooms`);
        }
    } catch (error) {
        console.error('Error deleting expired rooms:', error);
    }
});
router.post('/create-temporary', async (req, res) => {
    try {
        const { name, durationInHours, durationInMinutes, durationInSeconds,adminId } = req.body;

        // Calculate the expiration time
        const durationInMilliseconds =
            (durationInHours * 60 * 60 * 1000) +
            (durationInMinutes * 60 * 1000) +
            (durationInSeconds * 1000);

        const expiresAt = new Date(Date.now() + durationInMilliseconds);
        if (!adminId) {
            return res.status(400).json({ error: 'Admin ID is required' });
        }
        const group = new TemporaryGroup({
            name,
            expiresAt,
            admin: adminId
        });

        await group.save();
        res.status(201).json(group);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



const createUniqueRoomId = () => {
    // Implement your logic for generating unique room IDs
    return Math.random().toString(36).substring(2, 15);
};

router.post('/rooms/create', async (req, res) => {
    try {
         console.log('Request Body:', req.body);
        const { name, adminId } = req.body;

        if (!name || !adminId) {
            return res.status(400).json({ error: 'Name and Admin ID are required' });
        }

        const admin = await User.findById(adminId);

        if (!admin) {
            return res.status(400).json({ error: 'Admin ID is invalid' });
        }

        const newRoom = new Room({ name, admin: admin._id });
        await newRoom.save();
        res.json({ roomId: newRoom._id, name: newRoom.name, createdAt: newRoom.createdAt, adminName: admin.name });
    } catch (error) {
        console.error('Error creating room:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


router.post('/rooms/create-private', async (req, res) => {
    try {
        const { name, password,adminId } = req.body;
        const roomId = createUniqueRoomId();
        if (!adminId) {
            return res.status(400).json({ error: 'Admin ID is required' });
        }
        const newRoom = new PrivateGroup({ name, isPrivate: true, password, roomId,admin: adminId });
        await newRoom.save();
        res.status(201).json({ roomId: newRoom._id });
    } catch (error) {
        console.error('Error creating private room:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/rooms/join/private', async (req, res) => {
    try {
        const { roomId, password, userEmail } = req.body;

        // Fetch room by roomId and populate the admin field to get admin details
       const room = await PrivateGroup.findById(roomId).populate('admin');
console.log("Fetched Room:", room); // Log the entire room object

if (!room) {
    return res.status(404).send('Room not found');
}

const admin = room.admin;
if (!admin || !admin.email) {
    return res.status(500).send('Admin email not found');
}

console.log("Fetched Admin Details:", admin);

        // If no password is provided, request password from the admin
        if (!password) {
            const admin = room.admin; // Admin should have the 'email' field
            console.log("admin",admin.email);
            console.log("room-admin-detail:",admin);

            if (!admin || !admin.email) {
                return res.status(500).send('Admin email not found');
            }

            // Create email options to send to the private room's admin
            const mailOptions = {
                from: 'saadhussaini678@gmail.com', // Authenticated email (stays the same)
                to: admin.email, // This is the dynamic part, send to room admin's email
                subject: 'Password Request for Private Room',
                html: `
                    <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                    <div style="max-width: 600px;backgroundColor:"blue";height:200px">

                    </div>
                        <div style="text-align: center;">
                            <img src="https://img.freepik.com/premium-photo/diverse-group-friends-casually-chatting-couch_1282444-263137.jpg";" alt="Website Logo" style="width: 150px; margin-bottom: 20px;">
                        </div>
                        <h1>Roomey Chat</h1>
                        <h2 style="color: #007bff;">Private Room Password Request</h2>
                        <p>Hello <strong>${admin.name || "Admin"}</strong>,</p>
                        <p>User with the email <strong>${userEmail}</strong> has requested the password for the private room <strong>${room.name}</strong>.</p>
                        <p>Please share the password with the user at your earliest convenience.</p>
                        <div style="text-align: center; margin: 40px 0;">
                            <a href="mailto:${userEmail}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Send Password to User</a>
                        </div>
                        <p style="font-size: 12px; color: #777;">If you did not request this email, you can ignore it.</p>
                    </div>
                `
            };

            // Send the email to the room's admin
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('Error sending email:', error);
                    return res.status(500).send('Error sending email to admin');
                }
                console.log('Email sent:', info.response);
                res.status(200).send('Password request sent to admin');
            });

        } else if (room.password !== password) {
            // If the password provided by the user is incorrect
            return res.status(403).send('Invalid password');
        } else {
            // If the password matches, allow the user to join the room
            res.status(200).send('Password correct');
        }
    } catch (error) {
        console.error('Error joining private room:', error);
        res.status(500).send('Server error');
    }
});


const transporter = nodemailer.createTransport({
    service: 'gmail',
    host:'smtp.gmail.com',
    port: 587,
    auth: {
      user: 'saadhussaini678@gmail.com',
      
      pass: 'rtvikshxrtsdjdsf', // Your Gmail password
    },
  });
router.get('/rooms', async (req, res) => {
    try {
        const publicRooms = await Room.find().populate('users');
        const privateRooms = await PrivateGroup.find();
        const temporaryGroups = await TemporaryGroup.find();
        const scheduledRooms = await ScheduledRoom.find();
        const allRooms = [...publicRooms, ...privateRooms, ...temporaryGroups, ...scheduledRooms];
        res.status(200).json(allRooms);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch rooms' });
    }
});


router.get('/:id', async (req, res) => {
    const roomId = req.params.id;
    console.log(roomId)
    try {
        let room = await Room.findById(roomId).populate('users').populate('admin') ||
                   await PrivateGroup.findById(roomId).populate('admin') ||
                   await TemporaryGroup.findById(roomId).populate('admin') ||
                   await ScheduledRoom.findById(roomId).populate('admin');

        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }

        if (room.expiresAt && new Date() > new Date(room.expiresAt)) {
            await Room.findByIdAndDelete(roomId);
            await PrivateGroup.findByIdAndDelete(roomId);
            await TemporaryGroup.findByIdAndDelete(roomId);
            await ScheduledRoom.findByIdAndDelete(roomId);
            await groupModal.deleteMany({ roomId });
            return res.status(410).json({ error: 'Room has expired and has been deleted' }); 
        }
        if (room.users) {
            room.users = [...new Map(room.users.map(user => [user._id.toString(), user])).values()];
        }

        res.json(room);
    } catch (error) {
        console.error('Error fetching room:', error);
        return res.status(500).json({ error: 'An error occurred while fetching the room' });
    }
});


router.get('/:id/messages', async (req, res) => {
    try {
        const messages = await groupModal.find({ roomId: req.params.id });
        res.status(200).json(messages);
    } catch (error) {
        console.error('Error fetching room messages:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/messages', async (req, res) => {
    try {
        console.log('Request Body:', req.body);
        const { roomId, text, sender } = req.body;
        if (!roomId || !text || !sender) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const message = new groupModal({
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

router.delete('/rooms/:id', async (req, res) => {
    try {
        
        const roomId = req.params.id;
        const deletedRoom = await Room.findByIdAndDelete(roomId) ||
                            await PrivateGroup.findByIdAndDelete(roomId) ||
                            await TemporaryGroup.findByIdAndDelete(roomId) ||
                            await ScheduledRoom.findByIdAndDelete(roomId);

        if (!deletedRoom) {
            return res.status(404).json({ message: 'Room not found' });
           
        }
        if (deletedRoom.expiresAt && new Date(deletedRoom.expiresAt) < new Date()) {
            return res.status(400).json({ message: 'Room has already expired and was deleted.' });
        }

        await groupModal.deleteMany({ roomId });
        res.status(200).json({ message: 'Room deleted successfully' });
    } catch (error) {
        console.error('Error deleting room:', error);
        res.status(500).json({ error: 'Server error' });
    }
});



router.post('/rooms/create-scheduled', async (req, res) => {
    try {
        const { name, startDate, endDate,adminId } = req.body;
        
        // Validate dates
        if (new Date(startDate) > new Date(endDate)) {
            return res.status(400).json({ error: 'Start date must be before end date' });
        }
        if (!adminId) {
            return res.status(400).json({ error: 'Admin ID is required' });
        }
        const scheduledRoom = new ScheduledRoom({
            name,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            admin: adminId

        });

        await scheduledRoom.save();
        res.status(201).json(scheduledRoom);
    } catch (error) {
        console.error('Error creating scheduled room:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
