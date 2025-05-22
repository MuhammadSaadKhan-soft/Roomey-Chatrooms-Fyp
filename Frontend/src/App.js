import React, { useContext, useState,useEffect } from 'react';
import './App.css';
import Navbar from './Components/header/Navbar';
import Alert from './Components/chatting/Alert';
import Sidebar from './Components/Sidebar/Sidebar'; // Import the Sidebar component
import CreateRoom from './Components/roomCreation/CreateRoom'; // Import the Home component
import { Routes, Route, Navigate,useLocation  } from 'react-router-dom';
import Registration from './Components/userData/Registration';
import Login from './Components/userData/Login';
import ProfileManagement from './Components/userData/ProfileManagement';
import ForgetPassword from './Components/userData/ForgetPassword';
import Reset from './Components/userData/Reset';
import { AuthContext } from './Components/Contexts/AuthContext';
import GroupsChat from "../src/Components/chatting/GroupsChat"
import Video from './Components/roomCreation/Video';
import Loading from './Loading';


function App() {
  const { auth } = useContext(AuthContext);
  const [mode, setMode] = useState('light');
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const showAlert = (message, type) => {
    setAlert({ msg: message, type: type });
    setTimeout(() => setAlert(null), 5000);
  };
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  const toggleMode = () => {
    if (mode === 'dark') {
      setMode('light');
      document.body.style.backgroundColor = 'white';
    } else {
      setMode('dark');
      document.body.style.backgroundColor = '#0D0E12';
      showAlert('Dark mode has been enabled', 'success');
    }
  };
 
  useEffect(() => {
    const handleLoading = () => {
      setLoading(true);
      setTimeout(() => setLoading(false), 720); // Simulate a network request
    };

    handleLoading();
  }, [location]);
  return (
    <div>
      <Navbar
  buttonText={`${mode === 'light' ? 'Light Mode' : 'Dark Mode'}`}
  title="Roomy"
  mode={mode}
  toggleMode={toggleMode}
  auth={auth}
  toggleSidebar={toggleSidebar} // Ensure toggleSidebar is passed as a prop
/>
{loading &&  <Loading />}
{ auth.isAuthenticated &&  isSidebarOpen &&   <Sidebar toggleSidebar={toggleSidebar} mode={mode} toggleMode={toggleMode}  showAlert={showAlert}/> }
   
     <Alert alert={alert} showAlert={showAlert} />
    
      <Routes> 
        
        <Route path="/registration" element={<Registration mode={mode} showAlert={showAlert} />} />
      
     
        {auth.isAuthenticated ? (
          <>
           {/* <Route path="/" element={<Mainpage />} /> */}
          
            
          
            <Route path="/chat/:roomId"  element={<GroupsChat mode={mode} toggleMode={toggleMode}  />}/>
            <Route path="/profileManagement" element={<ProfileManagement showAlert={showAlert} mode={mode} toggleMode={toggleMode} />}  />
            <Route path="/room/:roomId" element={<Video mode={mode} toggleMode={toggleMode} />}  />
            <Route path="/create_room" element={<CreateRoom  toggleSidebar={toggleSidebar}/>} /> 
            
            {/* <Route path="/admin_panel" element={<AdminPanel mode={mode} toggleMode={toggleMode} />} />
            <Route path="/GraphData" element={<GraphData mode={mode} toggleMode={toggleMode} />} /> */}
          </>
        ) : (
        
          <Route path="/login" element={<Login showAlert={showAlert} mode={mode} />} />
          
        )}
        
        <Route path="/forget-password" element={<ForgetPassword mode={mode} />} />
        <Route path="/reset-password" element={<Reset  mode={mode}/>} />
      
        {!auth.isAuthenticated && <Route path="*" element={<Navigate to="/login" />} />}
         
        {!auth.isAuthenticated && <Route path="*" element={<Navigate to="/registration" />} />}
      </Routes>
    </div>
  );
}

export default App;
