import React from 'react';

import CustomAudioPlayer from '../videoComponents/CustomAudioPlayer';

const Message = ({ sender, message, classs, timestamp, profilePicture, audioUrl ,themes}) => {
  const formattedTimestamp = new Date(timestamp).toLocaleTimeString();

  if (!message && !audioUrl) {
    return null;
  }

  // console.log('Audio URL:', audioUrl);  

  return (
    <div className={`messageContainer ${classs}`}>
    <div className={`message ${classs}`}>
      {profilePicture && <img src={profilePicture} alt="Profile" className="profilePicture" />}
      <strong className={themes?'dark-mode text-white':'light-mode text-black'}>{sender}:</strong>
      {message && !audioUrl && <span>{message}</span>}
      {audioUrl && (
        <div className="audioContainer">
          <CustomAudioPlayer audioUrl={audioUrl} />
        </div>
      )}
    </div>
    <div className={`timestamp ${classs}`}>{formattedTimestamp}</div>
  </div>
  );
};

export default Message;
