import React from 'react';
import '../css/Message.css';
import CustomAudioPlayer from '../videoComponents/CustomAudioPlayer';

const Message = ({ sender, message, classs, timestamp, profilePicture, audioUrl }) => {
  const formattedTimestamp = new Date(timestamp).toLocaleTimeString();

  if (!message && !audioUrl) {
    return null;
  }

  // console.log('Audio URL:', audioUrl);  

  return (
    <div className={`messageContainer ${classs}`}>
      <div className={`message ${classs}`}>
        {profilePicture && <img src={profilePicture} alt="Profile" className="profilePicture" />}
        <strong>{sender}:</strong> 
        {message && !audioUrl && <span>{message}</span>}
        {audioUrl && (
          <div className="audioContainer">
              
             <CustomAudioPlayer audioUrl={audioUrl} /> 
          </div>
        )}
      </div>
      <div className={`timestamp ${classs}`}>
        {formattedTimestamp}
      </div>
    </div>
  );
};

export default Message;
