import React, { useEffect, useState, useRef } from 'react';
import socketIO from 'socket.io-client';
import Message from '../roomCreation/Message';
import '../css/Chat.css';
import { useParams, useLocation ,useNavigate} from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVideo, faBell, faPaperPlane,faSmile,faBars, faTimes,faMicrophone ,faPencilAlt, faSave, } from '@fortawesome/free-solid-svg-icons';
import VideoRoom from '../videoComponents/VideoRoom';
import { AxiosRequest } from '../Axios/AxiosRequest';
import ReactScrollToBottom from 'react-scroll-to-bottom';
import EmojiPicker from 'emoji-picker-react';
import io from 'socket.io-client';
import ReactRecorder from '../videoComponents/ReactRecorder';


const ENDPOINT = 'http://localhost:5000';

const GroupsChat = ({ roomName, mode }) => {
    const { roomId } = useParams();
    const location = useLocation();
    const [roomname, setRoomname] = useState(location.state?.roomName);
    const [user, setUser] = useState('');
    const [id, setId] = useState('');
    const [messages, setMessages] = useState([]);
    const [currentMessage, setCurrentMessage] = useState('');
    const socketRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [notifications, setNotifications] = useState([]); 
    const [headerMessage, setHeaderMessage] = useState('');
    const [notificationCount, setNotificationCount] = useState(0);
    const [admin, setAdmin] = useState('');
    const [profilePicture, setProfilePicture] = useState('');
    const [userCount, setUserCount] = useState(0); 
    const [userList, setUserList] = useState([]);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [audioPreviewUrl, setAudioPreviewUrl] = useState(null);
    const [joinedUsers, setJoinedUsers] = useState(new Set());
    const [roomUsers, setRoomUsers] = useState(new Map());
    const [currentUser, setCurrentUser] = useState({ id: null });
    const [editingMessageId, setEditingMessageId] = useState(null);
    const [editedMessageText, setEditedMessageText] = useState('');
    const navigate=useNavigate();
  
    // const socket = io("http://localhost:5000");
    // socketRef.current = socket;
    useEffect(() => {
        console.log("Updated user list:", userList);
    }, [userList]); 
    useEffect(() => {
        const socket = io("http://localhost:5000");
        
        socket.on('userJoined', (data) => {
            setNotifications((prevNotifications) => [...prevNotifications, { message: data.message }]);
            setNotificationCount((prevCount) => prevCount + 1);
    
            // Update the user list in real-time
            setUserList((prevUserList) => [...prevUserList, data.user]);
        });
        
        socket.on('usernameUpdated', (data) => {
            // console.log('usernameUpdated event received:', data);
            setUserList(prevUserList => {
                return prevUserList.map(user => 
                    user.userId === data.userId ? { ...user, name: data.name } : user
                );
            });
        });
    
      
    
        socket.on('userRemoved', (data) => {
            // console.log('User to be removed:', data.userId);
            if (!data.userId) {
                console.error('Invalid userId:', data.userId);
                return;
            }
            setUserList(prevUserList => {
                return prevUserList.filter(user => user._id !== data.userId);
            });
            
            // console.log(`User ${data.userId} has been removed from room ${roomId}`);
        });
    
        socket.on('userList', (users) => {
            setUserList(users);
        });
    
        
    
    
        socket.on('blockedFromRoom', (data) => {
            alert(data.message); // Show the user they are blocked
        });
   
        
        return () => {
            socket.off('userJoined');
            socket.off('usernameUpdated');
            socket.off('userRemoved');
            socket.off('userList');
            socket.off("removedFromRoom");
            socket.off('roomCreated');
            socket.off("blockedFromRoom")
           
        };
    }, []);
    
    useEffect(() => {
        const userData = sessionStorage.getItem('userData');
        const token = sessionStorage.getItem('jwt');
        

        if (!userData && !token) {
            throw new Error('User data not found in localStorage');
        }
        
        const parsedUserData = JSON.parse(userData);
        const parsedUserDataJwt = JSON.parse(userData);
        
        // console.log('Parsed user data:', parsedUserData); // Debug log
    
        const userName = parsedUserData.name || parsedUserData.login || 'Guest User'; // Handle null name
        const userId = parsedUserData._id || 'Unknown ID'; // Handle null ID
        const profilePicture = parsedUserData.profilePicture ||parsedUserData.avatar_url||''; // Default if null
        
        setUser(userName);
        setId(userId);
        setProfilePicture(profilePicture);
        
        // console.log('User Image URL:', profilePicture);
    
        fetchRoomDetails();
    

        if (!socketRef.current) {
            socketRef.current = socketIO(ENDPOINT, { transports: ['websocket'] });

            socketRef.current.on('connect', () => {
                socketRef.current.emit('joined', { user: parsedUserData.name, roomId });
            });
            
            socketRef.current.on('welcome', handleIncomingMessage);
            socketRef.current.on('userJoined', handleIncomingMessage);
            socketRef.current.on('userLeft', handleIncomingMessage);
           // Client-side: Listening for new messages
socketRef.current.on('newMessage', (messageData) => {
    // console.log('Received new message:', messageData);  // Debugging: check if the message is received
    const { user, message, messageId, timestamp, profilePicture, audioUrl, roomId } = messageData;

    // Add the message to your state or update the UI
    setMessages((prevMessages) => [
        ...prevMessages,
        {
            _id: messageId, // Use the messageId for future reference, such as for editing
            text: message,
            sender: user,
            timestamp,
            profilePicture,
            audioUrl,
            roomId,
            isEdited: false, // Initially, it's not edited
        }
    ]);
});

            socketRef.current.on('newAudioMessage', (data) => {
                setMessages((prevMessages) => [...prevMessages, {
                  sender: data.sender,
                  text: '', // Empty because it's an audio message
                  timestamp: data.timestamp,
                  profilePicture: data.profilePicture,
                  audioUrl: data.audioUrl,
                }]);
              });
              socketRef.current.on('userInfo', (data) => {
                setUserCount(data.userCount);  // Update user count
                setUserList(data.users);  // Update user list with profile pictures
                // console.log("user info",data.users);
            });
            
            socketRef.current.on('userNotFoundInRoom', ({ userId, roomId }) => {
                setNotifications((prevNotifications) => [
                  ...prevNotifications,
                  { message: `User ${userId} not found in room ${roomId}` },
                ]);
                setNotificationCount((prevCount) => prevCount + 1);
              });
            socketRef.current.on('userRemoved', (data) => {
                const userId = data.userId;
                const userName = data.username;
                console.log('userNmae',userName);
                setNotifications((prevNotifications) => [
                  ...prevNotifications,
                  { message: `${userName} has been removed by Admin` }
                ]);
                
                
            
                    
                
              });
        }
        socketRef.current.on('messageUpdated', (updatedMessage) => {
            // console.log('Received updated message:', updatedMessage);
        
            setMessages((prevMessages) =>
                prevMessages.map((msg) =>
                    msg._id === updatedMessage._id ? updatedMessage : msg
                )
            );
          
        });
        socketRef.current.on('messageDeleted', handleMessageDeleted)
        
        fetchPreviousMessages();
        //  socketRef.current.emit('joinRoom', { roomId,  user });
         socketRef.current.on('joinVideoRoom', (data) => {
            // console.log('Received joinVideoRoom event:', data); // Debug log
            if (data && data.message) {
              setNotifications((prevNotifications) => [
                ...prevNotifications,
                { message: data.message },
              ]);
            }
          });
         
        // socketRef.current.on('joinVideoRoom', (data) => {
        //     console.log('Received joinVideoRoom event:', data); // Ensure the event is received
        //     if (data && data.message && data.sender !== user) {
        //         // Only show the notification if the message is from someone else
        //         setNotifications((prevNotifications) => [
        //             ...prevNotifications,
        //             { message: data.message }
        //         ]);
                
        //         // Increase the notification count
        //         setNotificationCount((prevCount) => prevCount + 1);
        //     }
        // });
        
        
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [roomId]);
 
    const fetchRoomDetails = async () => {
        try {
            const response = await AxiosRequest.get(`http://localhost:5000/api/${roomId}`);
            // console.log('Fetched room:', response.data);
            setAdmin(response.data.admin?.name || '');
            setUserList(response.data.users || []);
           
            setRoomname(response.data.name || '');
        } catch (error) {
            if (error.response && (error.response.status === 404 || error.response.status === 410)) {
                
             //window.location.href = '/create_room'; 
            }
            if (error.response && error.response.status === 404) {
                console.log('Room not found or has expired and been deleted');
               
            } else if (error.response && error.response.status === 410) {
                console.log('Room has expired');
               
            } else {
                console.error('Error fetching room details:', error);
                throw new Error('Room not found');
            }
        }
    };
    
      
    
    const fetchPreviousMessages = async () => {
        setLoading(true);
        try {
            const response = await AxiosRequest.get(`/api/messages/${roomId}`);
            if (response.data) {
                setMessages(response.data.messages);
            } else {
                console.error('Empty response data received.');
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setLoading(false);
        }
    };
    const handleMessageDeleted = (data) => {
        const { messageId } = data;
        // Filter out the deleted message from the messages state
        setMessages((prevMessages) => prevMessages.filter(msg => msg._id !== messageId));
    };

    // Delete message function to send the request to the backend
    const deleteMessage = (messageId) => {
        // console.log('Message ID:', messageId);  // Log messageId to check if it's valid
        if (!messageId || typeof messageId !== 'string') {
            console.error('Invalid messageId:', messageId);
            return;
        }
    
        console.log('Attempting to delete message with ID:', messageId);
        
        // Make the DELETE request to the backend
        AxiosRequest.delete(`/delete/${messageId}`)
            .then((response) => {
                if (response.data.message === 'Message deleted successfully') {
                    console.log(`Message with ID ${messageId} deleted`);
                    // Optionally update the UI to reflect message deletion (e.g., remove the message from the list)
                } else {
                    console.error('Error deleting message:', response.data.error);
                }
            })
            .catch((error) => {
                console.error('Error deleting message:', error);
            });
    };
    
      const handleVideoIconClick = () => {
        if (socketRef.current) {
          // Emit 'joinVideoRoom' when the video icon is clicked
          socketRef.current.emit('joinVideoRoom', { roomId, user });
        }
      };
            
   
    
   
    
    
      const handleIncomingMessage = (data) => {
        if (data.message) {
            if (data.message.includes('has joined the room')) {
                setNotifications(prev => [...prev, { message: data.message }]);
                setNotificationCount(prevCount => prevCount + 1);
                setJoinedUsers(prev => new Set(prev).add(data.message));
            }else if (data.message.includes('has left')) {
                setNotifications(prevNotifications => [...prevNotifications, { message: data.message }]);
                setNotificationCount(prevCount => prevCount + 1);
                setJoinedUsers(prev => {
                    const updated = new Set(prev);
                    updated.delete(data.message);
                    return updated;
                });
            } else if (data.id && data.user && data.message && data.timestamp) {
                setMessages(prev => {
                    const isDuplicate = prev.some(msg => msg.id === data.id);
                    if (!isDuplicate) {
                        return [...prev, {
                            sender: data.user,
                            text: data.message,
                            timestamp: data.timestamp,
                            profilePicture: data.profilePicture,
                            audioUrl: data.audioUrl ? `http://localhost:5000${data.audioUrl}` : null
                        }];
                    }
                    return prev;
                });
            } else {
              
            }
        } else {
            setMessages(prev => [...prev, {
                sender: data.sender,
                text: data.text,
                timestamp: data.timestamp,
                profilePicture: data.profilePicture,
                audioUrl: data.audioUrl ? `http://localhost:5000${data.audioUrl}` : null
            }]);
        }
    };
    const handleEditClick = (messageId, text) => {
        setEditingMessageId(messageId);    // Store the message ID being edited
        setEditedMessageText(text);         // Prefill the input with the current text
    };
    
    const handleSaveEdit = async () => {
        try {
            // Send PUT request with both messageId and edited text
            const response = await AxiosRequest.put(`/edit/edit`, {
                messageId: editingMessageId,  // Pass the messageId
                text: editedMessageText       // Pass the edited message text
            });
    
            if (response.data) {
                const updatedMessage = response.data;
    
                // Update the message in state with the new text and mark it as edited
                setMessages((prevMessages) =>
                    prevMessages.map((msg) =>
                        msg._id === updatedMessage._id // Match by message ID
                            ? { ...msg, text: updatedMessage.text, isEdited: true }
                            : msg
                    )
                );
               
                // Exit edit mode and clear input field
                setEditingMessageId(null);
                setEditedMessageText('');
            }
        } catch (error) {
            console.error('Error editing message:', error);
        }
    };
    
    
    
    
    

    const sendMessage = async (text) => {
        if (text.trim() !== '') {
            const messageData = {
                roomId,
                text,
                sender: user,
                timestamp: new Date(),
                profilePicture,
            };

            if (socketRef.current) {
                socketRef.current.emit('sendMessage', messageData);
            }
            setCurrentMessage('');
        }
    };
    const handleEmojiClick = (emoji) => {
        setCurrentMessage(prevMessage => prevMessage + emoji.emoji);
        setShowEmojiPicker(true);
    };
    const toggleDropdown = () => setShowDropdown(!showDropdown);
 const handleSendAudio = async (audioBlob) => {
    socketRef.current = socketIO(ENDPOINT, { transports: ['websocket'] });


    if (!audioBlob) {
        console.error('No audioBlob provided.');
        return;
    }
   
    console.log('Sending audio...');
    console.log('RoomId:', roomId);
    console.log('Sender:', user);
    console.log('profilePicture',profilePicture);
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.wav');
    formData.append('roomId', roomId);
    formData.append('sender', user);
    formData.append('profilePicture',profilePicture)
    formData.append('text', '');

    try {
        const response = await AxiosRequest.post('http://localhost:5000/api/audio', formData, {
            headers: {
                'Content-Type': 'multipart/form-data', // Ensure this is set correctly
            },
        });
        console.log('Audio sent successfully', response.data);
        fetchPreviousMessages();

        socketRef.current.emit('newAudioMessage', {
            roomId,
            sender: user,
            audioUrl: response.data.audioUrl,
            timestamp: new Date(),
            profilePicture,
          });
    } catch (error) {
        console.error('Error sending audio:', error.response ? error.response.data : error.message);
    }
};

    

    
    
    
useEffect(() => {
    // Clear notifications only when the dropdown is opened
    if (!showDropdown) {
        handleNotificationCheck();
    }
}, [showDropdown]);
    
    

const handleSetPreview = (blob) => {
    if (blob) {
        const previewUrl = URL.createObjectURL(blob);
        setAudioPreviewUrl(previewUrl);

        // Cleanup URL after use
        return () => URL.revokeObjectURL(previewUrl);
    }
};


const handleNotificationCheck = () => {
    // Clear the notifications and reset the count
    setNotifications([]);
    setNotificationCount(0);
  
    // Check for user removal notifications
    notifications.forEach((notification) => {
      if (notification.message.includes('has been removed by an admin')) {
        setNotifications((prevNotifications) => [...prevNotifications, notification]);
        setNotificationCount((prevCount) => prevCount + 1);
      }
    });
  };
  const handleRemoveUser = async (user) => {
    // Ensure user and roomId are valid
    if (!user || !user.name) {
        console.error("Invalid user object:", user);
        return;
    }

    if (!roomId) {
        console.error("Invalid roomId:", roomId);
        return;
    }

    // Ensure socket is connected
    if (socketRef.current) {
        socketRef.current.emit("removeUser", { username: user.name, roomId }, (response) => {
            if (response.success) {
                console.log(`Removing user ${user.name} from room ${roomId}`);
                setNotifications((prevNotifications) => [
                    ...prevNotifications,
                    { message: `User ${user.name} removed from room ${roomId} by admin` }
                ]);
                setNotificationCount((prevCount) => prevCount + 1);

                setUserList((prevUserList) =>
                    prevUserList.filter((u) => u.name !== user.name)
                );
            } else {
                console.error("Error removing user from room:", response.message);
            }
        });
    } else {
        console.error("Socket object is null, cannot emit removeUser event.");
    }
};
  // Button click handl
    return (
        <div className={`ChatPage ${mode === "dark" ? "black" : "white"}`}>
            <div  style={{border:'0.5px solid blue'}}className={`Sidebar `}>
                
                {profilePicture && <img src={profilePicture} alt="User" className="UserImage" />}
                <span>{user}</span>
                <ReactScrollToBottom>
                <div className="AdminName">Admin: {admin}</div>
                <div className="userCountContainer">
                    Users in count: {userCount}
                </div>
              
                <div className="UserList">
    {userList.length > 0 ? (
        userList.map((user, i) => {
            const storedUserData = sessionStorage.getItem('userData');
            const currentUser = storedUserData ? JSON.parse(storedUserData).name : null;
            console.log(currentUser); // Should now correctly print the name
            console.log(storedUserData);

            return (
                <li key={user._id}>
                    <img src={user.profilePicture} alt="User" className="UserImage" />
                    <span>{user.name}</span>

                    {/* Check if the logged-in user is the admin */}
                    {admin === currentUser && admin !== user.name && (
                        <button onClick={() => {
                            console.log("User:", user);
                            console.log("RoomId:", roomId);
                            handleRemoveUser(user); // Pass both user and roomId
                        }}>
                            Remove User
                        </button>
                    )}
                </li>
            );
        })
    ) : (
        <li>wait</li>
    )}
</div>


                
                 </ReactScrollToBottom>
            </div>
            
            <div className="ChatContainer">
                <div className={`Header ${mode === 'dark' ? 'dark-mode' : 'light-mode'}`}>
                <FontAwesomeIcon style={{ color: mode === "dark" ? "black" : "white" }} icon={faVideo} onClick={() => {
    setShowModal(true);
    handleVideoIconClick();
}} />
                     {/* <FontAwesomeIcon style={{ color: mode === "dark" ? "black" : "white" }} icon={faMicrophone} onClick={() => setShowModal(true)} 
/> */}
                    {roomname}
                   
                    <div className={`NotificationIcon ${showDropdown ? 'show-dropdown' : ''}`} onClick={toggleDropdown}>
                   
                        <FontAwesomeIcon style={{ color: mode === "dark" ? "black" : "white" }} icon={faBell} />
                         {notificationCount > 0 && (
                            <span className="NotificationBadge">{notificationCount}</span>
                             
                                
                        )}
                        
                       
                        {showDropdown && (
                            <div className="DropdownMenu">
                                {notifications.length > 0 ? (
                                    notifications.map((notification, index) => (
                                        <p key={index}>{notification.message}</p>
                                    ))
                                ) : (
                                    <p>No new notifications</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
               
                <div className="ChatBox">
    {loading ? (
        <div>Loading...</div>
    ) : (
        messages.map((item) => (
            <div
                key={item._id}
                className={`message-container ${item.sender === user ? 'right' : 'left'}`}
            >
                <Message
                    sender={item.sender}
                    message={
                        editingMessageId === item._id ? (
                            <input
                                type="text"
                                value={editedMessageText}
                                onChange={(e) => setEditedMessageText(e.target.value)}
                                onBlur={() => handleSaveEdit(item._id)} // Save on input blur
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveEdit(item._id); // Save on Enter
                                }}
                                className="edit-input"
                                autoFocus // Focus on the input field
                            />
                        ) : (
                            <>
                                {item.text}
                                {item.isEdited && <span className="edited-label"> (edited)</span>}
                            </>
                        )
                    }
                    classs={item.sender === user ? 'right' : 'left'}
                    timestamp={item.timestamp}
                    profilePicture={item.profilePicture}
                    audioUrl={item.audioUrl}
                />
                
                {item.sender === user && !item.isEdited && editingMessageId !== item._id && (
                    <button
                        onClick={() => handleEditClick(item._id, item.text)}
                        className="edit-button"
                    >
                        <FontAwesomeIcon icon={faPencilAlt} /> Edit
                    </button>
                )}
                
                {/* Show the Delete button only if the current user is the sender of the message */}
                {item.sender === user && (
                    <button onClick={() => deleteMessage(item._id)} className="delete-button">
                        Delete
                    </button>
                )}
            </div>
        ))
    )}
</div>






                 
               
                
                <div className="InputBox">
                <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="EmojiButton" style={{backgroundColor:'#242736',
                            border:'1px solid blue',marginTop:'-2.5px',marginRight:'15px'}}>
                        <FontAwesomeIcon icon={faSmile} />
                    </button>
                    {showEmojiPicker && (
                        <div className="EmojiPicker">
                            <EmojiPicker onEmojiClick={handleEmojiClick} />
                        </div>
                    )}
                    <input
                        type="text"
                        id="chatInput"
                        value={currentMessage}
                        onChange={(e) => setCurrentMessage(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                sendMessage(currentMessage);
                            }
                        }}
                        
                        style={{
                            paddingLeft: '30px',
                            backgroundColor: mode === "dark" ? "#333" : "#f9f9f9",
                            color: mode === "dark" ? "white" : "black",
                            border: mode === "dark" ? "1px solid #ccc" : "1px solid #333",
                            marginLeft:'-5px'
                        }}
                    />
                 {audioPreviewUrl && <audio controls src={audioPreviewUrl}></audio>}
        
        {isRecording ? (
                      <ReactRecorder
                      
                      onRecord={(blob) => {
                        handleSetPreview(blob);
                      }}
                      onStop={(blob) => {
                        handleSendAudio(blob);
                      }}
                      onSendAudio={handleSendAudio}
                    />
                    ) : (
                        <button className='audio-button' style={{backgroundColor:'#242736',
                            border:'1px solid blue', marginLeft: '0px', marginRight: '10px' }}  onClick={() => setIsRecording(!isRecording)}>
                        <FontAwesomeIcon icon={faMicrophone}  />
                    </button>
                    )}
                    
                  
                   
                   
                    <button  className="SendButton"
                    
                        onClick={() => sendMessage(currentMessage)}
                        style={{
                            
                            color: "white",
                            border: "none",
                            borderRadius: "5px",
                            cursor: "pointer",
                            padding: "10px 20px",
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginTop:'-1px',
                            marginLeft:'10px',
                            backgroundColor:'#242736',
                            border:'1px solid blue',
                            
                        }}
                    >
                        <FontAwesomeIcon icon={faPaperPlane} style={{ marginRight: '8px',padding:'2px',}} />
                        Send
                    </button>
                </div>
            </div>
            <VideoRoom showModal={showModal} setShowModal={setShowModal} />
             {/* <Audio showModal={showModal} setShowModal={setShowModal}/>   */}
        </div>
    );
};

export default GroupsChat;
