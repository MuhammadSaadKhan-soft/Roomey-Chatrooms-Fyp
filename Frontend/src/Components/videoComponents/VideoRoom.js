import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useParams } from 'react-router';
import { io } from 'socket.io-client';
import "../css/Modal.css"
const socket = io('http://localhost:5000'); // Initialize the socket connection outside the component

const VideoRoom = ({ showModal, setShowModal }) => {
    const [value, setValue] = useState('');
    const navigate = useNavigate();
    const { roomId } = useParams();
    const [message, setMessage] = useState('');
    const user = localStorage.getItem('username'); // Assume the username is stored in localStorage

    const handleJoinRoom = useCallback(() => {
        if (value === roomId) {
            // Navigate to the room if it matches
            // navigate(`/room/${roomId}`);
           // Reload the page from the server
            // Navigate to the new room URL
window.location.href = `/room/${roomId}`;


            setShowModal(false); // Close the modal after navigating
            
            // Emit the joinRoom event to notify the server
            socket.emit('joinRoom', { roomId, sender: user });
        } else {
            alert('The entered Room ID does not match the current room. Please try again.');
        }
    }, [navigate, setShowModal, value, roomId, user]);

    useEffect(() => {
        if (roomId && user) {
            // Emit when the video room is opened
            socket.emit('videoRoomOpened', { roomId, sender: user });
            console.log('Video room opened and event emitted to server');
        }
    
        // Listen for notifications from the server
        socket.on('joinVideoRoom', (data) => {
            console.log('Received joinVideoRoom event:', data); // Debug log
            setMessage(data.message);
            alert(data.message); // Example notification
        });
    
        // Clean up the socket event listener on unmount
        return () => {
            socket.off('joinVideoRoom');
        };
    }, [roomId, user]);
    

    return (
        <>
            {showModal && (
                <div className="modal" tabIndex="-1" role="dialog" style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <div className="modal-dialog"  role="document">
                        <div className="modal-content" style={{backgroundColor:'#242736'}}>
                            <div className="modal-header" >
                                <h5 className="modal-title" style={{color:'white'}}>Join Video Room</h5>
                                <button style={{borderRadius:'30px' }} type="button" className="close" onClick={() => setShowModal(false)} aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <input
                                    className="form-control"
                                    placeholder="Enter Room Id Here"
                                    type="text"
                                    value={value}
                                    onChange={e => setValue(e.target.value)}
                                />
                            </div>
                            <h6 style={{color:'white',marginLeft:'50px'}}>Room Id needed here!</h6>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-primary" onClick={handleJoinRoom}>
                                    Join
                                </button>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default VideoRoom;
