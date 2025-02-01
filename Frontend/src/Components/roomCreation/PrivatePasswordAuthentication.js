import React, { useState } from 'react';
import { AxiosRequest } from '../Axios/AxiosRequest';

const PrivatePasswordAuthentication = () => {
    const [roomId, setRoomId] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await AxiosRequest.post('/api/rooms/join/private', { roomId, password });
            if (response.status === 200) {
                alert('Joined room successfully');
            }
        } catch (error) {
            if (error.response && error.response.status === 403) {
                alert('Invalid password');
            } else {
                console.error('Error joining room:', error);
            }
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>Room ID:</label>
                <input type="text" value={roomId} onChange={(e) => setRoomId(e.target.value)} required />
            </div>
            <div>
                <label>Password:</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button type="submit">Join Room</button>
        </form>
    );
};

export default PrivatePasswordAuthentication;
