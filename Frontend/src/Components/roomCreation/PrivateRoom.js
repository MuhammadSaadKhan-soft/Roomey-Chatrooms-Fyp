import React, { useState } from 'react';
import { AxiosRequest } from '../Axios/AxiosRequest';

const PrivateRoom = () => {
    const [name, setName] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);
    const [password, setPassword] = useState('');
    const [roomName, setRoomName] = useState('');
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await AxiosRequest.post('/api/rooms/create/private', { name, isPrivate, password })
            .then(response => {
                console.log('Room created:', response.data);
                const roomId = response.data.roomId;
                setRoomName('');
                window.location.href = `/chat/${roomId}?roomName=${encodeURIComponent(roomName)}`;
            })
            .catch(error => {
                console.error('Error creating room:', error);
            });
            alert(`Room created with ID: ${response.data.roomId}`);
        } catch (error) {
            console.error('Error creating room:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>Room Name:</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
                <label>
                    <input type="checkbox" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} />
                    Private Room
                </label>
            </div>
            {isPrivate && (
                <div>
                    <label>Password:</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
            )}
            <button type="submit">Create Room</button>
        </form>
    );
};

export default PrivateRoom;
