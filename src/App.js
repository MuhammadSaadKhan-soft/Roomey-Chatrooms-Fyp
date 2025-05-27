import React, { useContext, useState, useEffect } from 'react';
import './App.css';
import Navbar from './Components/header/Navbar';
import Alert from './Components/chatting/Alert';
import Sidebar from './Components/Sidebar/Sidebar';
import CreateRoom from './Components/roomCreation/CreateRoom';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Registration from './Components/userData/Registration';
import Login from './Components/userData/Login';
import ProfileManagement from './Components/userData/ProfileManagement';
import ForgetPassword from './Components/userData/ForgetPassword';
import Reset from './Components/userData/Reset';
import { AuthContext } from './Components/Contexts/AuthContext';
import GroupsChat from '../src/Components/chatting/GroupsChat';
import Video from './Components/roomCreation/Video';
import Loading from './Loading';
import { ThemeContext } from './Components/utils/ThemeContext';

function App() {
  const { auth } = useContext(AuthContext);
  const {theme,toggleMode}= useContext(ThemeContext);
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
 
  const showAlert = (message, type) => {
    setAlert({ msg: message, type: type });
    setTimeout(() => setAlert(null), 5000);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const handleLoading = () => {
      setLoading(true);
      setTimeout(() => setLoading(false), 720);
    };

    handleLoading();
  }, [location]);

  return (
    <div>
      <Navbar
        title="Roomy"
        auth={auth}
        toggleSidebar={toggleSidebar}
        themes={theme}
        toggleMode={toggleMode}
      />
      
      {loading && <Loading />}

      {auth.isAuthenticated && isSidebarOpen && (
        <Sidebar toggleSidebar={toggleSidebar} showAlert={showAlert}  themes={theme}/>
      )}

      <Alert alert={alert} showAlert={showAlert} />

      <Routes>
        <Route path="/registration" element={<Registration showAlert={showAlert} themes={theme} toggleMode={toggleMode}/>} />

        {auth.isAuthenticated ? (
          <>
            <Route path="/chat/:roomId" element={<GroupsChat  themes={theme}/>} />
            <Route path="/profileManagement" element={<ProfileManagement showAlert={showAlert} themes={theme} toggleMode={toggleMode} />} />
            <Route path="/room/:roomId" element={<Video />} />
            <Route path="/create_room" element={<CreateRoom toggleSidebar={toggleSidebar} themes={theme}/>} />
          </>
        ) : (
          <Route path="/login" element={<Login showAlert={showAlert} themes={theme} toggleMode={toggleMode} />} />
        )}
        {!auth.isAuthenticated && <Route path="*" element={<Navigate to="/login" themes={theme} toggleMode={toggleMode}/>} />}
        {!auth.isAuthenticated && <Route path="*" element={<Navigate to="/registration" />} />}
        {!auth.isAuthenticated &&   <Route path="/forget-password" element={<ForgetPassword themes={theme}/>} />}
        {!auth.isAuthenticated && <Route path="/reset-password" element={<Reset themes={theme}/>} /> }
      </Routes>
    </div>
  );
}

export default App;
