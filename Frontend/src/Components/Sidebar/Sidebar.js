import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { AxiosRequest } from "../Axios/AxiosRequest"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import "../css/sidebar.css"
import { faTrashAlt } from "@fortawesome/free-solid-svg-icons"
import { Modal, Button, Form } from "react-bootstrap"
import io from "socket.io-client"

const Sidebar = ({ toggleSidebar, mode, toggleMode, showAlert }) => {
  const [rooms, setRooms] = useState([])
  const [isOpen, setIsOpen] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [password, setPassword] = useState("")
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [activeRoomId, setActiveRoomId] = useState(null)
  const [passwordError, setPasswordError] = useState("")
  const [roomError, setRoomError] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const navigate = useNavigate()
  const [isEmailTyped, setIsEmailTyped] = useState(false)
  const [showEmailModal, setShowEmailModal] = useState(false)
  // Handle email input change and update state
  const handleEmailChange = (e) => {
    setUserEmail(e.target.value)
    // If email input is not empty, mark email as typed
    setIsEmailTyped(e.target.value.length > 0)
  }
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    return emailRegex.test(email)
  }
  useEffect(() => {
    fetchRooms()
    const intervalId = setInterval(fetchRooms, 5000) // Polling every 5 seconds

    return () => clearInterval(intervalId) // Cleanup interval on component unmount
  }, [])

  const fetchRooms = () => {
    AxiosRequest.get("http://localhost:5000/api/rooms")
      .then((response) => {
        const currentTime = new Date().getTime()
        const updatedRooms = response.data.filter(
          (room) => !room.expiresAt || new Date(room.expiresAt).getTime() > currentTime,
        )
        console.log("Updated rooms:", updatedRooms)
        setRooms(updatedRooms)

        const pathParts = window.location.pathname.split("/chat/")
        const currentRoomId = pathParts.length > 1 ? pathParts[1] : null
        console.log("currentRoomId", currentRoomId)

        const currentRoom = updatedRooms.find((room) => room._id === currentRoomId)
        console.log("current room", currentRoom)

        if (!currentRoom && currentRoomId) {
          // Room expired or not found, redirect to previous room if it exists
          const roomIndex = updatedRooms.findIndex((room) => room._id === currentRoomId)
          let previousRoom
          setTimeout(()=>{
            if (roomIndex > 0) {
              previousRoom = updatedRooms[roomIndex - 1]
            } else if (roomIndex < updatedRooms.length - 1) {
              previousRoom = updatedRooms[roomIndex + 1]
            }
          },1000)
          

          if (previousRoom) {
            setTimeout(()=>{
              navigate(`/create_room`)
            },1000)
           
          } else {
            navigate("/") // Navigate to home or another default page if no rooms are left
          }
        }
      })
      .catch((error) => {
        if (error.response && error.response.status === 404) {
          console.log("Room not found or has expired")
        } else {
          console.error("Error fetching room details:", error)
        }
      })
  }

  const toggleMenu = () => {
    if (isOpen) {
      // If the sidebar is being closed, reset the active room ID
      setActiveRoomId(null)
    }
    setIsOpen(!isOpen)
    toggleSidebar()
  }
  const deleteRoom = (roomId) => {
    // Retrieve logged-in user data from localStorage
    const userData = JSON.parse(localStorage.getItem("userData"))
    console.log("User data from localStorage:", userData)

    const adminId = userData ? userData._id : null

    if (!adminId) {
      console.error("Admin ID is missing.")
      showAlert("You must be logged in as an admin to delete rooms.", "danger")
      return
    }

    // Find the room to be deleted
    const room = rooms.find((room) => room._id === roomId)

    if (room) {
      // Ensure the logged-in user is the admin who created the room
      if (room.admin === adminId) {
        // Proceed with the deletion
        AxiosRequest.delete(`http://localhost:5000/api/rooms/${roomId}`)
          .then((response) => {
            console.log("Room deleted successfully:", response.data.message)
            setRooms((prevRooms) => {
              const updatedRooms = prevRooms.filter((room) => room._id !== roomId)

              // Find a public room to navigate to if it exists
              const publicRoom = updatedRooms.find((room) => !room.isPrivate)
              if (publicRoom) {
                navigate(`/chat/${publicRoom._id}`)
              } else {
                navigate("/") // Redirect to home if no public rooms are available
              }

              return updatedRooms
            })
          })
          .catch((error) => {
            console.error("Error deleting room:", error)
            showAlert("Failed to delete the room. Please try again.", "danger")
          })
      } else {
        showAlert("You are not authorized to delete this room.", "danger")
      }
    } else {
      showAlert("Room not found.", "danger")
    }
  }

  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value)
  }

  const searchRooms = () => {
    return rooms.filter((room) => room.name.toLowerCase().includes(searchQuery.toLowerCase()))
  }

  const handleRoomClick = (room) => {
    if (room.isPrivate) {
      setSelectedRoom(room)
      setShowPasswordModal(true)
    } else {
      setActiveRoomId(room._id)
      navigate(`/chat/${room._id}`)
      showAlert(`Welcome to ${room.name}`, "welcome")
    }
  }

  const handleEnterRoom = () => {
    if (showEmailModal) {
      if (!userEmail.trim() || !validateEmail(userEmail)) {
        setPasswordError("Please enter a valid email address.")
        return
      }
      // Send email to admin
      AxiosRequest.post("http://localhost:5000/api/rooms/join/private", { roomId: selectedRoom._id, userEmail })
        .then((response) => {
          if (response.status === 200) {
            showAlert("Password request sent to admin", "success")
            setShowEmailModal(false)
          } else {
            setPasswordError("Failed to send request to admin")
          }
        })
        .catch((error) => {
          console.error("Error sending request to admin:", error)
          setPasswordError("Failed to send request to admin")
        })
    } else {
      if (!password.trim()) {
        setPasswordError("Please enter the password.")
        return
      }

      AxiosRequest.post("http://localhost:5000/api/rooms/join/private", { roomId: selectedRoom._id, password })
        .then((response) => {
          if (response.status === 200) {
            setPasswordError("")
            setActiveRoomId(selectedRoom._id)
            navigate(`/chat/${selectedRoom._id}`)
            showAlert(`Welcome to ${selectedRoom.name}`, "success")
          } else {
            setPasswordError("Invalid password")
          }
        })
        .catch((error) => {
          console.error("Error joining private room:", error)
          setPasswordError("Invalid password")
          showAlert("Invalid password entered", "danger")
        })
        .finally(() => {
          setPassword("")
          setShowPasswordModal(false)
        })
    }
  }

  const formatDateTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleString() // Returns date and time in the locale format
  }

  return (
    <div
      className={`offcanvas offcanvas-start w-25 ${isOpen ? "show" : ""} `}
      tabIndex="-1"
      id="offcanvas"
      data-bs-keyboard="false"
      data-bs-backdrop="false"
    >
      <div className="offcanvas-header" style={{ marginTop: "-10px" }}>
        <button
          type="button"
          className="btn-close text-reset"
          style={{ marginLeft: "320px", color: "white", fontSize: "30px" }}
          onClick={toggleMenu}
          aria-label="Close"
        >
          X
        </button>
      </div>
      <div className="offcanvas-body px-0">
        <ul className="nav nav-pills flex-column mb-sm-auto mb-0 align-items-start" id="menu">
          <li>
            <div className="mb-3">
              <input
                type="text"
                style={{ width: "100%", marginRight: 120 }}
                className="form-control"
                placeholder="Search Groups"
                value={searchQuery}
                onChange={handleSearchInputChange}
              />
            </div>
            {roomError && <p className="text-danger">{roomError}</p>} {/* Display the room error */}
            <ul style={{ listStyleType: "none", paddingLeft: 0 }}>
              {searchRooms().map((room) => (
                <li
                  key={room._id}
                  onClick={() => handleRoomClick(room)}
                  style={{
                    cursor: "pointer",
                    height: "50px",
                    marginBottom: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 15px",
                    borderRadius: "8px",
                    backgroundColor: room._id === activeRoomId ? "rgba(255, 0, 0, 0.1)" : "rgba(255, 255, 255, 0.05)",
                    border: room._id === activeRoomId ? "2px solid red" : "2px solid transparent",
                    boxShadow:
                      room._id === activeRoomId ? "0 0 10px rgba(255, 0, 0, 0.3)" : "0 0 5px rgba(0, 0, 0, 0.1)",
                    transition: "background-color 0.3s, border 0.3s, box-shadow 0.3s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)")}
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      room._id === activeRoomId ? "rgba(255, 0, 0, 0.1)" : "rgba(255, 255, 255, 0.05)")
                  }
                >
                  <div>
                    <span style={{ color: "white" }}>
                      {room.name}
                      {room.isPrivate && <span className="badge bg-secondary ms-2">Private</span>}
                      {room.expiresAt && <span className="badge bg-warning ms-2">Temporary</span>}
                      {room.startDate && <span className="badge bg-primary ms-2">Scheduled</span>}
                      {room.endDate && (
                        <span className="badge bg-danger ms-0">End: {formatDateTime(room.endDate)}</span>
                      )}
                    </span>
                  </div>
                  <div>
                    <FontAwesomeIcon
                      icon={faTrashAlt}
                      style={{ color: "red", cursor: "pointer" }}
                      onClick={(event) => {
                        event.stopPropagation() // Prevent modal or navigation
                        deleteRoom(room._id)
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </li>
        </ul>
      </div>

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
                setPassword(e.target.value)
                setPasswordError("") // Reset error on input change
              }}
              isInvalid={!!passwordError} // Highlight input if there's an error
            />
          </Form.Group>
          {passwordError && <p className="text-danger mt-2">{passwordError}</p>}
        </Modal.Body>
        <Modal.Footer className="custom-modal-footer">
          <Button
            style={{ textDecoration: "none" }}
            variant="link"
            onClick={() => {
              setShowPasswordModal(false)
              setShowEmailModal(true)
            }}
          >
            Need help? Enter email for assistance
          </Button>
          <Button variant="primary" onClick={handleEnterRoom}>
            Join
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal show={showEmailModal} onHide={() => setShowEmailModal(false)} className="custom-modal">
        <Modal.Header closeButton className="custom-modal-header">
          <Modal.Title>Request Access</Modal.Title>
        </Modal.Header>
        <Modal.Body className="custom-modal-body">
          <Form.Group>
            <Form.Label>User Email</Form.Label>
            <Form.Control type="email" placeholder="Enter your email" value={userEmail} onChange={handleEmailChange} />
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
          <Button variant="secondary" onClick={() => setShowEmailModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleEnterRoom}>
            Send Request
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default Sidebar

