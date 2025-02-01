import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";

const Video = ({ mode }) => {
    const { roomId } = useParams();
    const [roomJoined, setRoomJoined] = useState(false);
    
    // Retrieve user data from local storage
    const userData = sessionStorage.getItem('userData');
    const parsedUserData = userData ? JSON.parse(userData) : null; // Safely parse or set to null
    console.log('Parsed User Data:', parsedUserData);
    console.log('Room ID:', roomId);
    
    useEffect(() => {
        const myMeeting = async (element) => {
            const appID = 1892858743;
            const serverSecret = "7f21dda423b78955a939ab8db85f35c4";
            
            
            if (!parsedUserData || !parsedUserData.name) {
                console.error('Error: Missing username. Make sure user data is available.');
                return; 
            }

            const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(appID, serverSecret, roomId, Date.now().toString(), parsedUserData.name);
            const zc = ZegoUIKitPrebuilt.create(kitToken);
            zc.joinRoom({
                container: element,
                sharedLinks: [{
                    name: 'Copy Link',
                    url: `http://localhost:3000/room/${roomId}`
                }],
                scenario: {
                    mode: mode === 'dark' ? ZegoUIKitPrebuilt.VideoConference.Dark : ZegoUIKitPrebuilt.VideoConference.Light,
                },
                showScreenSharingButton: true,
                video: {
                    resolution: '1080p',
                    bitrate: 3000,
                    frameRate: 30
                },
                audio: {
                    bitrate: 128,
                    samplingRate: 44100
                },
                success: () => {
                    console.log('Room joined successfully');
                    setRoomJoined(true);
                },
                error: (err) => {
                    console.error('Error joining room:', err);
                    setRoomJoined(false);
                }
            });
            console.log('Mode:', mode);
        }

        // Call myMeeting function when component mounts
        const element = document.getElementById('video-container');
        if (element) {
            myMeeting(element);
        }

        // Clean up function
        return () => {
            // Perform any necessary cleanup
        };
    }, [roomId, mode, parsedUserData]); // Add parsedUserData to dependencies

    const handleJoinRoom = () => {
        if (roomJoined) {
            console.log('Already joined room');
        } else {
            console.log('Joining room...');
            // You can optionally implement additional logic here before joining the room
        }
    };

    useEffect(() => {
        const customStyle = document.createElement('style');
        customStyle.innerHTML = `
            /* Custom styles for prebuilt UI elements */
            .zego-tool-panel .icon {
                color: ${mode === 'dark' ? '#FFFFFF' : '#000000'};
            }
            
            .zego-tool-panel .icon:hover {
                background-color: ${mode === 'dark' ? '#333333' : '#DDDDDD'};
            }

            /* Custom styles for page background */
            .custom-body {
                background-color: ${mode === 'dark' ? '#000000' : '#FFFFFF'};
                margin: 0;
                padding: 0;
                overflow: hidden;
            }

            /* Ensure video container covers the entire screen */
            .full-screen-video {
                position: absolute;
                top: 50px;
                left: 0;
                width: 100%;
                height: calc(100% - 50px);
            }
            
            /* Navbar styling */
            .Navbar {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 50px;
                background-color: #ffffff;
                z-index: 100;
            }

            /* Join room toggle styling */
            .join-room-toggle {
                background-color: ${mode === 'dark' ? '#333333' : '#DDDDDD'};
                color: ${mode === 'dark' ? '#FFFFFF' : '#000000'};
            }
        `;
        document.head.appendChild(customStyle);

        return () => {
            document.head.removeChild(customStyle);
        };
    }, [mode]);

    return (
        <div id="video-container" className={`full-screen-video ${mode === 'dark' ? 'dark-mode' : 'light-mode'}`}>
            <button className="join-room-toggle" style={{backgroundColor:'black', color:"white"}} onClick={handleJoinRoom}>
                Join Room
            </button>
        </div>
    );
}

export default Video;
