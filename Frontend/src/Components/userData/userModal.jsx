import React from 'react';
import Modal from 'react-modal';
import '../css/userModal.css'; // Ensure you have this CSS file imported

const UserModal = ({ isOpen, onClose, user }) => {
  if (!user) return null;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="User Profile"
      className="user-modal"
      overlayClassName="modal-overlay"
    >
      <h2>User Details</h2>
      <div className="user-modal-content">
        <img 
          src={user.profilePicture || 'default-profile.png'} 
          alt="User" 
          className="user-image" 
        />
        <p><strong>Name:</strong> {user.name || 'Unknown User'}</p>
        <p><strong>Email:</strong> {user.email || 'No Email Available'}</p>
        <p><strong>Interest:</strong> {user.interest ? user.interest.join(', ') : 'No Interest Specified'}</p>
      </div>
      <button onClick={onClose} className="close-button">Close</button>
    </Modal>
  );
};

export default UserModal;
