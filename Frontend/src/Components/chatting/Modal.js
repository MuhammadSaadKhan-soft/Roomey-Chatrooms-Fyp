// Modal.js
import React from 'react';
import '../css/Modal.css'; // Import CSS file for modal styling

const Modal = ({ showModal, setShowModal }) => {
    if (!showModal) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <span className="close-btn" onClick={() => setShowModal(false)}>&times;</span>
                <h2>Video Modal</h2>
                <p>Content for the video modal goes here.</p>
                {/* Add more content or components as needed */}
            </div>
        </div>
    );
};

export default Modal;
