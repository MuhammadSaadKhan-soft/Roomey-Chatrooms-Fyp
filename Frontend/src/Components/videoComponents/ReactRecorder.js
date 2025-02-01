import React, { useState, useRef, useEffect } from 'react';
import '../css/audio.css'; // Import the CSS file for styling
import { faVideo, faBell, faPaperPlane,faSmile,faBars, faTimes,faMicrophone } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
const ReactRecorder = ({ onSendAudio }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const [audioUrl, setAudioUrl] = useState(null);
    const mediaRecorderRef = useRef(null);
    const [chunks, setChunks] = useState([]);

    useEffect(() => {
        return () => {
            if (audioUrl) {
                console.log('Revoking audio URL:', audioUrl);
                URL.revokeObjectURL(audioUrl);
            }
        };
    }, [audioUrl]);
    
    useEffect(() => {
        if (audioBlob) {
            const url = URL.createObjectURL(audioBlob);
            setAudioUrl(url);
            // Cleanup URL when the component unmounts or audioBlob changes
            return () => URL.revokeObjectURL(url);
        }
    }, [audioBlob]);
    const handleStartRecording = async () => {
        try {
            console.log('Starting recording...');
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
    
            const tempChunks = [];
            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    tempChunks.push(event.data);
                    console.log('Data available:', event.data);
                }
            };
    
            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(tempChunks, { type: 'audio/wav' });
                console.log('Recording stopped, blob created:', blob);
                setAudioBlob(blob);
    
                const url = URL.createObjectURL(blob);
                setAudioUrl(url);
                console.log('Audio URL created:', url);
    
                if (typeof onSendAudio === 'function') {
                    console.log('Sending audio...');
                    onSendAudio(blob);
                } else {
                    console.error('onSendAudio is not a function or is missing');
                }
            };
    
            mediaRecorderRef.current.start();
            console.log('Recording started');
            setIsRecording(true);
        } catch (error) {
            console.error('Error accessing media devices:', error);
        }
    };
    
    const handleStopRecording = () => {
        if (mediaRecorderRef.current) {
            console.log('Stopping recording...');
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };
    

    return (
        <div className="react-recorder">
            <button className={`record-button ${isRecording ? 'recording' : ''}`} onClick={isRecording ? handleStopRecording : handleStartRecording}>
                {/* {isRecording ? '' : 'Start Recording'} */}
              {isRecording ?<FontAwesomeIcon icon={faMicrophone}/>: <FontAwesomeIcon icon={faMicrophone}  />}
            </button>
           
        </div>
    );
};
ReactRecorder.defaultProps = {
    onSendAudio: () => console.warn('No onSendAudio handler provided'),
};

export default ReactRecorder;
