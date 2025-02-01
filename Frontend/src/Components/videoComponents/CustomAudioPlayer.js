import React, { useRef, useState, useEffect } from 'react';
import '../css/Message.css';

const CustomAudioPlayer = ({ audioUrl }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = audioUrl; // Set audio URL directly
      audioRef.current.load();
    }
  }, [audioUrl]);

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch((error) => {
            console.error('Error playing audio:', error);
          });
      }
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = ''; // Clear the source to prevent memory leaks
      }
    };
  }, []);

  return (
    <div className="customAudioPlayer">
      <button className="playPauseBtn"  onClick={handlePlayPause}>
        {isPlaying ? 'Pause' : 'Play'}
      </button>
      <audio ref={audioRef} controls className="audioElement">
        <source src={audioUrl} type="audio/wav" />
       
        Your browser does not support the audio element.
      </audio>
    </div>
  );
};

export default React.memo(CustomAudioPlayer);
