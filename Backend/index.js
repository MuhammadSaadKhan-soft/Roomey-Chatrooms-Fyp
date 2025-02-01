// server.js
const Room=require('./models/Rooms');
const express = require('express');
const http = require('http');
const SocketIO = require('socket.io');
const connectToMongo = require('./db');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const groupMessage = require("./models/groupmodel");
const app = express();
const server = http.createServer(app);
const path = require('path');
const User=require('./models/User');

const io = SocketIO(server, {
  cors: {
    origin: "http://localhost:3000", // or your client URL
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  }
});

const port = process.env.PORT || 5000;

const routeUpload = require('./route/routeUpload');
const authRouter = require('./route/auth');
const githubauthRouter = require('./route/githubAuth');
const roomsRoute = require("./route/roomsRoute");
const messagesRouter = require("./route/groupmessages");
const audioHandle=require("./route/audioHandlingRoute");
const groupMessageEdit=require("./route/groupmessages");
app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Routes
app.use('/api/auth', authRouter);
app.use('/api/githubauth', githubauthRouter);
app.use('/api/image', routeUpload);
app.set('view engine', 'ejs');
app.use('/api', roomsRoute);
app.use('/api/messages', messagesRouter);
app.use("/api/audio",audioHandle);
app.use('/api/edit',groupMessageEdit)
connectToMongo();
const users = {}; 
const roomUsers = {};
const blockedUsers = {};
const onlineUsers = new Set();
const updateUserCount = async (roomId) => {
    try {
        const usersInRoom = Array.from(roomUsers[roomId] || []);
        const userCount = usersInRoom.length;

        const usersWithProfilePictures = await Promise.all(
            usersInRoom.map(async (user) => {
                const profilePicture = await getUserProfilePicture(user);
                return { name: user, profilePicture };
            })
        );
        

        // Emit both user count and user list at the same time
        io.to(roomId).emit('userInfo', { userCount, users: usersWithProfilePictures });
    } catch (error) {
        console.error('Error updating user count:', error);
    }
};

app.put('/edit/edit', async (req, res) => {
    try {
        const { messageId, text } = req.body;
        console.log('Received messageId:', messageId);  // Log the messageId
        console.log('Received text:', text);            // Log the text

        if (!messageId || !text) {
            return res.status(400).json({ error: 'Missing required fields: messageId or text' });
        }

        // Update the message in the database
        const updatedMessage = await groupMessage.findOneAndUpdate(
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
// Delete message route
app.delete('/delete/:messageId', async (req, res) => {
    try {
        const { messageId } = req.params;

        if (!messageId) {
            return res.status(400).json({ error: 'Missing required fields: messageId' });
        }

        // Delete the message from the database
        const deletedMessage = await groupMessage.findByIdAndDelete(messageId);

        if (!deletedMessage) {
            return res.status(404).json({ error: 'Message not found' });
        }

        console.log('Deleted message:', deletedMessage);

        // Emit the delete event to all connected clients via Socket.IO
        io.emit('messageDeleted', { messageId });

        // Return the deleted message confirmation response
        res.status(200).json({ message: 'Message deleted successfully', messageId });
    } catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({ error: 'Server error' });
    }
});


const getUserProfilePicture = async (username) => {
    const user = await User.findOne({ name: username });
    return user ? user.profilePicture : null;
};

io.on("connection", (socket) => {
  
    
    socket.on('joinRoom', async ({ roomId, username }) => {
        if (blockedUsers[roomId] && blockedUsers[roomId].has(username)) {
            console.log(`User ${username} is blocked from rejoining room ${roomId}`);
            return;
        }
    
        socket.join(roomId);
        await updateUserCount(roomId); // Update user count when the user joins
    
        // Emit welcome message and other necessary updates
        
    
        
    });
    
    
      
    socket.on('userOnline', (userData) => {
        onlineUsers[socket.id] = userData;  // Make sure userData has `name` and `email` properties
        io.emit('onlineUsers', Object.values(onlineUsers));  // Send the updated list of users to all clients
    });
    
    

    socket.on('joined', async({ user, roomId }) => {
        if (!roomUsers[roomId]) {
            roomUsers[roomId] = new Set();
        }
 
        if (Object.values(users).includes(user)) {
            console.log(`${user} is already connected`);
            return;
        }
       
        users[socket.id] = user;
        roomUsers[roomId].add(user);
        console.log(`${user} has joined room ${roomId}`);
        socket.join(roomId);
        

        socket.emit('welcome', {
            user: user, // The user who just joined
            message: "Welcome to the chat",
            roomId
        });
        
        socket.broadcast.to(roomId).emit('userJoined', { roomId, message: `${user} has joined the room` });
       
        socket.videoRoomJoined = false;
        // Set a timeout to reload or re-fetch user info after a delay (e.g., 3 seconds)
        setTimeout(async () => {
            const usersInRoom = Array.from(roomUsers[roomId] || []);
            const userCount = usersInRoom.length;
    
            const usersWithProfilePictures = await Promise.all(
                usersInRoom.map(async (user) => {
                    const profilePicture = await getUserProfilePicture(user);
                    return { name: user, profilePicture };
                })
            );
            io.to(roomId).emit('userInfo', { userCount, users: usersWithProfilePictures });
            
    
            // Emit both user count and user list at the same time
        }, 3000); // 3000 milliseconds (3 seconds) delay
       
        
    });
    socket.on('joinVideoRoom', ({ roomId, user }) => {
        // Emit the joinVideoRoom message only if not already emitted
        if (!socket.videoRoomJoined) {
            socket.to(roomId).emit('joinVideoRoom', { 
                message: `${user} has joined the video room.`
            });
            // Set the flag to prevent further emissions
            socket.videoRoomJoined = true;
        }
    });
    
    socket.on('disconnect', () => {
        const disconnectedUser = users[socket.id];
        const roomId = Object.keys(roomUsers).find(roomId => roomUsers[roomId].has(disconnectedUser));
        delete users[socket.id];
    
        if (disconnectedUser && roomId) {
            if (roomUsers[roomId]) {
                roomUsers[roomId].delete(disconnectedUser);
                if (roomUsers[roomId].size === 0) {
                    delete roomUsers[roomId];
                }
            }
    
            socket.broadcast.to(roomId).emit('userLeft', { message: `${disconnectedUser} has left` });
            updateUserCount(roomId);
            
        
            if (disconnectedUser) {
                delete onlineUsers[socket.id];  // Remove from online users
                io.emit('onlineUsers', Object.values(onlineUsers));  // Emit updated list
            }
        }
    });
    
    
    
    // server.js
    const findUserIdByUsername = async (username) => {
        try {
          const user = await User.findOne({ name: username });
          return user ? user._id : null;
        } catch (error) {
          console.error('Error finding user by username:', error);
          return null;
        }
      };
      
    //   socket.on('removeUser', async ({ username, roomId }) => {
    //     try {
    //         const userId = await findUserIdByUsername(username);
    //         if (!userId) {
    //             console.log(`User ${username} not found`);
    //             io.to(roomId).emit('userNotFound', { username, roomId }); 
    //             return;
    //         }
    
          
            
    
    //         const usersInRoom = Array.from(roomUsers[roomId] || []);
    //         console.log(`Users in room ${roomId}:`, usersInRoom);
    //         const userIndex = usersInRoom.length;
    //         if (userIndex === -1) {
    //             console.log(`User ${userId} is not a member of room ${roomId}`);
    //             io.to(roomId).emit('userNotInRoom', { userId, roomId }); // Notify client
    //             return;
    //         }
    
          
    
    //         console.log(`User ${userId} removed from room ${roomId}`);
    //         io.to(roomId).emit('userRemoved', { userId,username });
    
    //         // Remove the user from the roomUsers object
    //         roomUsers[roomId].delete(username); // Ensure the user is removed by username
    //         console.log(`User ${username} removed from roomUsers object`);
    
    //         // Prevent the user from reconnecting to the room
    //         socket.join(`blocked:${roomId}`);
    //         if (!blockedUsers[roomId]) {
    //             blockedUsers[roomId] = new Set(); // Initialize blocked list for the room
    //         }
    //         blockedUsers[roomId].add(username); // Block user from rejoining
    //         console.log(`User ${username} is blocked from rejoining room ${roomId}`);
    //         io.to(roomId).emit('blockedFromRoom', { username, message: "You are blocked from rejoining this room." });
    //         await updateUserCount(roomId); // Update user count and list
    //         console.log(`User count updated for room ${roomId}`);
    //     } catch (error) {
    //         console.error('Error removing user from room:', error);
    //     }
    // });

    socket.on('removeUser', async ({ username, roomId }) => {
        try {
            const userId = await findUserIdByUsername(username);
            if (!userId) {
                console.log(`User ${username} not found`);
                io.to(roomId).emit('userNotFound', { username, roomId });
                return;
            }
    
            const usersInRoom = Array.from(roomUsers[roomId] || []);
            console.log(`Users in room ${roomId}:`, usersInRoom);
            const userIndex = usersInRoom.length;
            if (userIndex === -1) {
                console.log(`User ${userId} is not a member of room ${roomId}`);
                io.to(roomId).emit('userNotInRoom', { userId, roomId });
                return;
            }
    
            console.log(`User ${userId} removed from room ${roomId}`);
            io.to(roomId).emit('userRemoved', { userId, username });
    
            // Remove the user from the roomUsers object
            roomUsers[roomId].delete(username);
            console.log(`User ${username} removed from roomUsers object`);
    
            // Prevent the user from reconnecting to the room
            socket.join(`blocked:${roomId}`);
            if (!blockedUsers[roomId]) {
                blockedUsers[roomId] = new Set();
            }

            
            blockedUsers[roomId].add(username);
            console.log(`User ${username} is blocked from rejoining room ${roomId}`);
            io.to(roomId).emit('blockedFromRoom', { username, message: "You are blocked from rejoining this room." });
    

            console.log(`Room ID ${roomId} added to blockedGroups for user ${username}`);
    
            await updateUserCount(roomId);
            console.log(`User count updated for room ${roomId}`);
        } catch (error) {
            console.error('Error removing user from room:', error);
        }
    });
      
      
      

    socket.on('usernameUpdated', (data) => {
        socket.broadcast.to(data.roomId).emit('usernameUpdated', data);
    });



    
   
    socket.on('sendMessage', async ({ roomId, text, sender, timestamp, profilePicture, audioUrl }) => {
        console.log('Received sendMessage event:', { roomId, text, sender, timestamp, audioUrl });
        
        const isAudioMessage = Boolean(audioUrl);
        const isTextMessage = Boolean(text);
    
        if (!isTextMessage && !isAudioMessage) {
            console.log('Message is empty, skipping save and emit.');
            return;
        }
    
        try {
            const room = await Room.findById(roomId);
    
            // Ensure the sender is in the room
            const usersInRoom = Array.from(roomUsers[roomId] || []);
            if (!usersInRoom.includes(sender)) {
                console.log(`User ${sender} has been removed from room ${roomId}.`);
                socket.emit('kickedFromRoom', { message: 'You have been removed from the room' });
                return;
            }
    
            const savedGroupMessage = await groupMessage.create({
                roomId,
                text: isTextMessage ? text : null,
                sender,
                timestamp: new Date(timestamp),
                profilePicture,
                audioUrl: isAudioMessage ? audioUrl : null
            });
    
            console.log('Message saved to database:', savedGroupMessage);
    
            // Emit the saved message with its generated _id (messageId)
            io.to(roomId).emit('newMessage', {
                user: sender,
                message: savedGroupMessage.text,
                messageId: savedGroupMessage._id,  // Send the generated messageId
                timestamp: savedGroupMessage.timestamp,
                profilePicture: savedGroupMessage.profilePicture,
                audioUrl: savedGroupMessage.audioUrl,
                roomId
            });
    
            console.log('Sent newMessage event to room:', roomId);
        } catch (error) {
            console.error('Error saving or sending message:', error);
        }
    });
    
    
    
    
    socket.on('sendAudio', (audioData) => {
        io.to(audioData.roomId).emit('newAudio', audioData);
    });
    socket.on('newAudioMessage', (data) => {
        io.in(data.roomId).emit('newAudioMessage', data);
      });

});
const getExpiredRooms = async () => {
    const currentTime = new Date().getTime();
    const expiredRooms = await Room.find({ expiresAt: { $lt: currentTime } });
    return expiredRooms;
};

const checkForExpiredRooms = async () => {
    const expiredRooms = await getExpiredRooms();

    expiredRooms.forEach(async (room) => {
        io.emit('roomExpired', room._id); // Notify clients about the expired room
        await room.remove(); // Delete the room from the database
        console.log(`Room ${room._id} has expired and been deleted.`);
    });
};

// Call this function at regular intervals
setInterval(checkForExpiredRooms, 5000); // Adjust the interval as needed

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});





// socket.on('sendMessage', async ({ roomId, text, sender, timestamp, profilePicture, audioUrl }) => {
//     console.log('Received sendMessage event:', { roomId, text, sender, timestamp, audioUrl });

//     const isAudioMessage = Boolean(audioUrl);
//     const isTextMessage = Boolean(text);

//     if (!isTextMessage && !isAudioMessage) {
//         console.log('Message is empty, skipping save and emit.');
//         return;
//     }

//     try {
//         const room = await Room.findById(roomId);
//         if (!room) {
//             console.log(`Room ${roomId} not found`);
//             return;
//         }

//         // Check if user is in the room in the database
//         let isUserInRoom = room.users.some(userId => userId.equals(sender));

//         if (!isUserInRoom) {
//             console.log(`User ${sender} is not a member of room ${roomId} in the database. Checking memory...`);

//             if (roomUsers[roomId] && roomUsers[roomId].has(sender)) {
//                 console.log(`User ${sender} is in memory, adding to database.`);

//                 // Find the user in the User collection to get their ObjectId
//                 const user = await User.findOne({ name: sender });
//                 if (!user) {
//                     console.log(`User ${sender} not found in the database.`);
//                     return;
//                 }

//                 room.users.push(user._id);
//                 await room.save();
//                 isUserInRoom = true;
//             } else {
//                 console.log(`User ${sender} is neither in memory nor in the database for room ${roomId}.`);
//                 socket.emit('kickedFromRoom', { message: 'You have been removed from the room' });
//                 return;
//             }
//         }

//         // Proceed to save and emit the message since the user is verified
//         const savedGroupMessage = await groupMessage.create({
//             roomId,
//             text: isTextMessage ? text : null,
//             sender,
//             timestamp: new Date(timestamp),
//             profilePicture,
//             audioUrl: isAudioMessage ? audioUrl : null
//         });

//         console.log('Message saved to database:', savedGroupMessage);

//         io.to(roomId).emit('newMessage', {
//             user: sender,
//             message: savedGroupMessage.text,
//             id: savedGroupMessage._id,
//             timestamp: savedGroupMessage.timestamp,
//             profilePicture: savedGroupMessage.profilePicture,
//             audioUrl: savedGroupMessage.audioUrl,
//             roomId
//         });

//         console.log('Sent newMessage event to room:', roomId);
//     } catch (error) {
//         console.error('Error saving or sending message:', error);
//     }
// });