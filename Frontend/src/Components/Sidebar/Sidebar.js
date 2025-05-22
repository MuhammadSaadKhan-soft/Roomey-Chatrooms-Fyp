import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AxiosRequest } from "../Axios/AxiosRequest";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { Modal, Button, Form } from "react-bootstrap";
import io from "socket.io-client";

const Sidebar = ({ toggleSidebar, mode, toggleMode, showAlert }) => {
  const [rooms, setRooms] = useState([]);
  const [isOpen, setIsOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState("");
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [activeRoomId, setActiveRoomId] = useState(null);
  const [passwordError, setPasswordError] = useState("");
  const [roomError, setRoomError] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const navigate = useNavigate();
  const [isEmailTyped, setIsEmailTyped] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  const handleEmailChange = (e) => {
    setUserEmail(e.target.value);
    setIsEmailTyped(e.target.value.length > 0);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  useEffect(() => {
    fetchRooms();
    const intervalId = setInterval(fetchRooms, 5000);

    return () => clearInterval(intervalId);
  }, []);

  const fetchRooms = () => {
    AxiosRequest.get("http://localhost:8080/api/rooms")
      .then((response) => {
        const currentTime = new Date().getTime();
        const updatedRooms = response.data.filter(
          (room) => !room.expiresAt || new Date(room.expiresAt).getTime() > currentTime
        );
        setRooms(updatedRooms);
  
        const currentRoomId = window.location.pathname.split("/chat/")[1];
  
        // Check if current room still exists
        const stillExists = updatedRooms.some((room) => room._id === currentRoomId);
  
        if (!stillExists && currentRoomId) {
          if (updatedRooms.length === 0) {
            navigate("/");
          } else {
            const publicRoom = updatedRooms.find((room) => !room.isPrivate);
            if (publicRoom) {
              navigate(`/chat/${publicRoom._id}`);
            } else {
              navigate("/create_room");
            }
          }
        }
      })
      .catch((error) => {
        console.error("Error fetching rooms:", error);
      });
  };
  

  const toggleMenu = () => {
    if (isOpen) {
      setActiveRoomId(null);
    }
    setIsOpen(!isOpen);
    toggleSidebar();
  };

  const deleteRoom = (roomId) => {
    const userData = JSON.parse(localStorage.getItem("userData"));
    const adminId = userData ? userData._id : null;
  
    if (!adminId) {
      showAlert("You must be logged in as an admin to delete rooms.", "danger");
      return;
    }
  
    const room = rooms.find((room) => room._id === roomId);
  
    if (!room) {
      showAlert("Room not found.", "danger");
      return;
    }
  
    if (room.admin !== adminId) {
      showAlert("You are not authorized to delete this room.", "danger");
      return;
    }
  
    AxiosRequest.delete(`http://localhost:8080/api/rooms/${roomId}`)
      .then(() => {
        const updatedRooms = rooms.filter((room) => room._id !== roomId);
        setRooms(updatedRooms);
  
        if (updatedRooms.length === 0) {
          // ✅ No rooms at all → go to homepage
          navigate("/");
        } else {
          const publicRoom = updatedRooms.find((room) => !room.isPrivate);
          if (publicRoom) {
            // ✅ Navigate to first public room
            navigate(`/chat/${publicRoom._id}`);
          } else {
            // ✅ No public room → go to create_room
            navigate("/create_room");
          }
        }
      })
      .catch((error) => {
        console.error("Error deleting room:", error);
        showAlert("Failed to delete the room. Please try again.", "danger");
      });
  };
  

  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const searchRooms = () => {
    return rooms.filter((room) => room.name.toLowerCase().includes(searchQuery.toLowerCase()));
  };

  const handleRoomClick = (room) => {
    if (room._id !== activeRoomId) { // Check if this room is not already active
      if (room.isPrivate) {
        setSelectedRoom(room);
        setShowPasswordModal(true);
      } else {
        setActiveRoomId(room._id); // Set the active room id
        navigate(`/chat/${room._id}`);
        showAlert(`Welcome to ${room.name}`, "welcome");
      }
    }
  };
  

  const handleEnterRoom = () => {
    if (showEmailModal) {
      if (!userEmail.trim() || !validateEmail(userEmail)) {
        setPasswordError("Please enter a valid email address.");
        return;
      }
      AxiosRequest.post("http://localhost:8080/api/rooms/join/private", { roomId: selectedRoom._id, userEmail })
        .then((response) => {
          if (response.status === 200) {
            showAlert("Password request sent to admin", "success");
            setShowEmailModal(false);
          } else {
            setPasswordError("Failed to send request to admin");
          }
        })
        .catch((error) => {
          console.error("Error sending request to admin:", error);
          setPasswordError("Failed to send request to admin");
        });
    } else {
      if (!password.trim()) {
        setPasswordError("Please enter the password.");
        return;
      }

      AxiosRequest.post("http://localhost:8080/api/rooms/join/private", { roomId: selectedRoom._id, password })
        .then((response) => {
          if (response.status === 200) {
            setPasswordError("");
            setActiveRoomId(selectedRoom._id);
            navigate(`/chat/${selectedRoom._id}`);
            showAlert(`Welcome to ${selectedRoom.name}`, "success");
          } else {
            setPasswordError("Invalid password");
          }
        })
        .catch((error) => {
          console.error("Error joining private room:", error);
          setPasswordError("Invalid password");
          showAlert("Invalid password entered", "danger");
        })
        .finally(() => {
          setPassword("");
          setShowPasswordModal(false);
        });
    }
  };

  const formatDateTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div
  className={`offcanvas offcanvas-start ${isOpen ? "show" : ""}`}
  style={{ width: '250px' }}  // Set the width here (200px)
  tabIndex="-1"
  id="offcanvas"
  data-bs-keyboard="false"
  data-bs-backdrop="false"
>
      <div className="offcanvas-header mt-2">
        <button
          type="button"
          className="btn btn-link text-danger fs-3 ms-auto"
          onClick={toggleMenu}
          aria-label="Close"
        >
          X
        </button>
      </div>
      <div className="offcanvas-body px-0">
        <ul className="list-group list-group-flush">
          <li className="list-group-item">
            <div className="mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Search Groups"
                value={searchQuery}
                onChange={handleSearchInputChange}
              />
            </div>
            {roomError && <p className="text-danger">{roomError}</p>}
            <ul className="list-unstyled px-0">
              {searchRooms().map((room) => (
                <li
                  key={room._id}
                  onClick={() => handleRoomClick(room)}
                  className={`d-flex align-items-center justify-content-between p-3 rounded-3 mb-2 ${
                    room._id === activeRoomId ? "bg-danger text-white" : "bg-light"
                  }`}
                >
                  <div>
                    <span>{room.name}</span>
                    {room.isPrivate && <span className="badge bg-secondary ms-2">Private</span>}
                    {room.expiresAt && <span className="badge bg-warning ms-2">Temporary</span>}
                    {room.startDate && <span className="badge bg-primary ms-2">Scheduled</span>}
                    {room.endDate && (
                      <span className="badge bg-danger ms-0">End: {formatDateTime(room.endDate)}</span>
                    )}
                  </div>
                  <div>
                    <FontAwesomeIcon
                      icon={faTrashAlt}
                      className="text-danger cursor-pointer"
                      onClick={(event) => {
                        event.stopPropagation();
                        deleteRoom(room._id);
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </li>
        </ul>
      </div>

      {/* Password Modal */}
      <Modal show={showPasswordModal} onHide={() => setShowPasswordModal(false)} className="custom-modal">
        <Modal.Header closeButton className="custom-modal-header">
          <Modal.Title>Enter Room Password</Modal.Title>
        </Modal.Header>
        <Modal.Body className="custom-modal-body">
          <Form.Group>
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter password (if you have one)"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError("");
              }}
              isInvalid={!!passwordError}
            />
          </Form.Group>
          {passwordError && <p className="text-danger mt-2">{passwordError}</p>}
        </Modal.Body>
        <Modal.Footer className="custom-modal-footer">
          <Button variant="link" onClick={() => { setShowPasswordModal(false); setShowEmailModal(true); }}>
            Need help? Enter email for assistance
          </Button>
          <Button variant="primary" className="btn btn-dark"onClick={handleEnterRoom}>
            Join
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Email Modal */}
      <Modal show={showEmailModal} onHide={() => setShowEmailModal(false)} className="custom-modal">
        <Modal.Header closeButton className="custom-modal-header">
          <Modal.Title>Request Access</Modal.Title>
        </Modal.Header>
        <Modal.Body className="custom-modal-body">
          <Form.Group>
            <Form.Label>User Email</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter your email"
              value={userEmail}
              onChange={handleEmailChange}
            />
            {!isEmailTyped && (
              <div className="text-container">
                <p className="typing-text">
                  If you don't know the password, enter your email and click approve to send an email to the admin.
                </p>
              </div>
            )}
            {userEmail && !validateEmail(userEmail) && <p className="text-danger mt-2">Please enter a valid email.</p>}
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="custom-modal-footer">
          <Button variant="primary" className="btn btn-dark" onClick={() => setShowEmailModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" className="btn btn-dark" onClick={handleEnterRoom}>
            Send Request
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Sidebar;
