import React, { useState } from 'react';
import { AxiosRequest } from '../Axios/AxiosRequest';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { Modal, Button, Form, Row, Col, Container, Card } from 'react-bootstrap';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useNavigate } from 'react-router-dom';

const CreateRoom = ({ mode, showAlert }) => {
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
        if (!roomName.trim()) return alert('Enter Room Name');

        const userData = JSON.parse(localStorage.getItem('userData'));
        const adminId = userData?._id;
        if (!adminId) return console.error('Admin ID missing');

        const roomData = { name: roomName, adminId };

        if (isScheduled && startDate && new Date(startDate) < new Date()) {
            return setError('Start date cannot be in the past.');
        }

        setError('');

        if (isTemporary) {
            if (durationHours > 24 || durationMinutes >= 60 || durationSeconds >= 60) {
                return setError('Invalid duration: max 24h 60m 60s.');
            }

            AxiosRequest.post('/api/create-temporary', {
                name: roomName, adminId, durationInHours: durationHours,
                durationInMinutes: durationMinutes, durationInSeconds: durationSeconds
            })
                .then(({ data }) => {
                    navigate(`/chat/${data._id}`, { state: { roomName, adminName: data.adminName } });
                }).catch(console.error);

        } else if (isPrivate) {
            setShowModal(true);

        } else if (isScheduled && startDate && endDate) {
            AxiosRequest.post('/api/rooms/create-scheduled', {
                name: roomName, adminId,
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString()
            })
                .then(({ data }) => {
                    navigate(`/chat/${data._id}`, { state: { roomName, adminName: data.adminName } });
                }).catch(console.error);

        } else {
            AxiosRequest.post('/api/rooms/create', roomData)
                .then(({ data }) => {
                    navigate(`/chat/${data.roomId}`, { state: { roomName, adminName: data.adminName } });
                }).catch(console.error);
        }
    };

    const handleCreatePrivateRoom = () => {
        const userData = JSON.parse(localStorage.getItem('userData'));
        const adminId = userData?._id;

        if (!roomName.trim() || !password.trim()) return;

        AxiosRequest.post('/api/rooms/create-private', { name: roomName, adminId, password })
            .then(({ data }) => {
                setShowModal(false);
                navigate(`/chat/${data.roomId}`, { state: { roomName, adminName: data.adminName } });
            }).catch(console.error);
    };

    return (
        <Container   style={{ minHeight: '100vh' }}>
            <Row className="justify-content-center">
                <Col xs={12} md={10} lg={8}>
                    <Card style={{ marginTop: '140px' }}>
                        <Card.Body>
                            <h2 className="text-center mb-4">Create Room</h2>
                            <Form>
                                <Form.Group className="mb-3">
                                    <Form.Control
                                        type="text"
                                        placeholder="Room Name"
                                        value={roomName}
                                        onChange={(e) => setRoomName(e.target.value)}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <Form.Select
                                        onChange={(e) => {
                                            const type = e.target.value;
                                            setIsPrivate(type === 'private');
                                            setIsTemporary(type === 'temporary');
                                            setIsScheduled(type === 'scheduled');
                                        }}
                                    >
                                        <option value="public">Public</option>
                                        <option value="private">Private</option>
                                        <option value="temporary">Temporary</option>
                                        <option value="scheduled">Scheduled</option>
                                    </Form.Select>
                                </Form.Group>

                                {isTemporary && (
                                    <Row className="mb-3">
                                        <Col>
                                            <Form.Label>Hours</Form.Label>
                                            <Form.Control
                                                type="number" min="0" max="24"
                                                value={durationHours}
                                                onChange={(e) => setDurationHours(Number(e.target.value))}
                                            />
                                        </Col>
                                        <Col>
                                            <Form.Label>Minutes</Form.Label>
                                            <Form.Control
                                                type="number" min="0" max="59"
                                                value={durationMinutes}
                                                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                                            />
                                        </Col>
                                        <Col>
                                            <Form.Label>Seconds</Form.Label>
                                            <Form.Control
                                                type="number" min="0" max="59"
                                                value={durationSeconds}
                                                onChange={(e) => setDurationSeconds(Number(e.target.value))}
                                            />
                                        </Col>
                                    </Row>
                                )}

                                {isScheduled && (
                                    <>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Start Date</Form.Label>
                                            <div className="bg-light p-2 rounded">
                                                <Calendar onChange={(date) => setStartDate(new Date(date))} value={startDate} />
                                            </div>
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <Form.Label>End Date</Form.Label>
                                            <div className="bg-light p-2 rounded">
                                                <Calendar onChange={(date) => setEndDate(new Date(date))} value={endDate} />
                                            </div>
                                        </Form.Group>
                                    </>
                                )}

                                {error && <div className="text-danger mb-3">{error}</div>}

                                <Button variant={mode === 'light' ? 'dark' : 'light'} onClick={handleCreateRoom}>
                                    <FontAwesomeIcon icon={faPlus} className="me-2" /> Create Room
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Create Private Room</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Control
                        type="password"
                        placeholder="Enter password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
                    <Button variant="primary" onClick={handleCreatePrivateRoom}>Create</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default CreateRoom;
