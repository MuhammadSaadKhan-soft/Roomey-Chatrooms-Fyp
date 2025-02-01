import React, { useState } from 'react';
import { AxiosRequest } from '../Axios/AxiosRequest';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import "../css/Home.css";
import { Modal, Button } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const CreateRoom = ({ toggleSidebar, mode, showAlert }) => {
    const [roomName, setRoomName] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);
    const [isTemporary, setIsTemporary] = useState(false);
    const [isScheduled, setIsScheduled] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [password, setPassword] = useState('');
    const [durationHours, setDurationHours] = useState(0);
    const [durationMinutes, setDurationMinutes] = useState(0);
    const [durationSeconds, setDurationSeconds] = useState(0);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleCreateRoom = () => {
        if (roomName.trim() === '') return alert('Enter Room Name');
        const userData = JSON.parse(localStorage.getItem('userData'));
        console.log('User data from localStorage:', userData);

        const adminId = userData ? userData._id : null;

        const roomData = {
            name: roomName,
            adminId
        };
        if (!adminId) {
            console.error('Admin ID is missing.');
            return;
        }

        // Validate Scheduled Room: Start date can't be in the past
        if (isScheduled && startDate && new Date(startDate) < new Date()) {
            setError('Start date cannot be in the past.');
            return;
        } else {
            setError('');
        }

        if (isTemporary) {
            // Validate Temporary Room: Hours, minutes, and seconds should be within limits
            if (durationHours > 24 || durationMinutes >= 60 || durationSeconds >= 60) {
                setError('Duration for temporary room must be 24 hours, 60 minutes, and 60 seconds max.');
                return;
            } else {
                setError('');
            }

            AxiosRequest.post('http://localhost:5000/api/create-temporary', {
                name: roomName,
                adminId,
                durationInHours: durationHours,
                durationInMinutes: durationMinutes,
                durationInSeconds: durationSeconds
            })
            .then(response => {
                const roomId = response.data._id;
                setRoomName('');
                setDurationHours(0);
                setDurationMinutes(0);
                setDurationSeconds(0);
                const adminName = response.data.adminName;
                navigate(`/chat/${roomId}`, { state: { roomName, adminName } });
            })
            .catch(error => {
                console.error('Error creating temporary room:', error);
            });
        } else if (isPrivate) {
            setShowModal(true);
        } else if (isScheduled && startDate && endDate) {
            AxiosRequest.post('http://localhost:5000/api/rooms/create-scheduled', {
                name: roomName,
                adminId,
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString()
            })
            .then(response => {
                const roomId = response.data._id;
                setRoomName('');
                setStartDate(null);
                setEndDate(null);
                const adminName = response.data.adminName;
                navigate(`/chat/${roomId}`, { state: { roomName, adminName } });
            })
            .catch(error => {
                console.error('Error creating scheduled room:', error);
            });
        } else {
            AxiosRequest.post('http://localhost:5000/api/rooms/create', roomData)
            .then(response => {
                const roomId = response.data.roomId;
                setRoomName('');
                const adminName = response.data.adminName;
                navigate(`/chat/${roomId}`, { state: { roomName, adminName } });
            })
            .catch(error => {
                console.error('Error creating room:', error.response ? error.response.data : error.message);
            });
        }
    };

    const handleCreatePrivateRoom = () => {
        if (roomName.trim() === '' || password.trim() === '') return;
        const userData = JSON.parse(localStorage.getItem('userData'));
        console.log('User data from localStorage:', userData);

        const adminId = userData ? userData._id : null;
        AxiosRequest.post('http://localhost:5000/api/rooms/create-private', { name: roomName, adminId, password })
        .then(response => {
            const roomId = response.data.roomId;
            setRoomName('');
            setPassword('');
            setShowModal(false);
            const adminName = response.data.adminName;
            navigate(`/chat/${roomId}`, { state: { roomName, adminName } });
        })
        .catch(error => {
            console.error('Error creating private room:', error);
        });
    };

    return (
        <div style={{ border: "2px solid blue" }} className={`home-container ${mode}`}>
            <h2 style={{ color: 'white' }}>Create Room</h2>
            <div className="input-group">
                <input
                    type="text"
                    placeholder="Room Name"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                />
                <select onChange={(e) => {
                    const value = e.target.value;
                    setIsPrivate(value === 'private');
                    setIsTemporary(value === 'temporary');
                    setIsScheduled(value === 'scheduled');
                }}>
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                    <option value="temporary">Temporary</option>
                    <option value="scheduled">Scheduled</option>
                </select>

                {isTemporary && (
                    <div className="duration-inputs">
                        <label htmlFor="Hours" style={{ color: "white" }}>Hours</label>
                        <input
                            type="number"
                            min="0"
                            max="24"
                            placeholder="Hours"
                            value={durationHours}
                            onChange={(e) => setDurationHours(Number(e.target.value))}
                            className="duration-field"
                        />
                        <label htmlFor="Minutes" style={{ color: "white" }}>Minutes</label>
                        <input
                            type="number"
                            min="0"
                            max="60"
                            placeholder="Minutes"
                            value={durationMinutes}
                            onChange={(e) => setDurationMinutes(Number(e.target.value))}
                            className="duration-field"
                        />
                        <label htmlFor="Seconds" style={{ color: "white" }}>Seconds</label>
                        <input
                            type="number"
                            min="0"
                            max="60"
                            placeholder="Seconds"
                            value={durationSeconds}
                            onChange={(e) => setDurationSeconds(Number(e.target.value))}
                            className="duration-field"
                        />
                    </div>
                )}

                {isScheduled && (
                    <div className="schedule-inputs">
                        <label style={{ color: "white" }}>Start Date</label>
                        <Calendar
                            onChange={(date) => setStartDate(new Date(date))}
                            value={startDate ? new Date(startDate) : new Date()}
                            className="calendar"
                        />
                        <p>Selected Start Date</p>

                        <label style={{ color: "white" }}>End Date</label>
                        <Calendar
                            onChange={(date) => setEndDate(new Date(date))}
                            value={endDate ? new Date(endDate) : new Date()}
                            className="calendar"
                        />
                        <p>Selected End Date</p>
                    </div>
                )}
            </div>
            {error && <div style={{ color: 'red' }}>{error}</div>}
            <button onClick={handleCreateRoom} className={`btn btn-${mode === 'light' ? 'dark' : 'light'}`}>
                <FontAwesomeIcon icon={faPlus} className="me-2" /> Create
            </button>

            <Modal show={showModal} onHide={() => setShowModal(false)} className="custom-modal">
                <Modal.Header closeButton>
                    <Modal.Title>Create Private Room</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="password-input"
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleCreatePrivateRoom}>
                        Create
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default CreateRoom;
