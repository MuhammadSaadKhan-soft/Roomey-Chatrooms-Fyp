import React, { useState } from 'react';
import { AxiosRequest } from '../Axios/AxiosRequest';
import { useNavigate } from 'react-router';
import '../css/Reset.css'; // Import your CSS file
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faKey, faLock } from '@fortawesome/free-solid-svg-icons';

const Reset = (props) => {
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const email = localStorage.getItem('Email');
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await AxiosRequest.post(
        '/api/auth/reset-password',
        { email, code, newPassword: password }
      );
      const data = response.data;

      if (data.status === 'success') {
        localStorage.removeItem('Email');
        alert(data.message);
        setTimeout(()=>{
          navigate('/login');
        },1000)
       
      } else {
        alert(data.message || 'An error occurred while processing your request.');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      alert('An unexpected error occurred. Please try again later.');
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleCodeChange = (e) => {
    setCode(e.target.value);
  };

  return (
    <div
      className="reset-password-container" // Use the same class name as in CSS
 
    >
 
      <div className="reset-password-form" style={{ 
        backgroundColor: props.mode === 'dark' ? 'black' : 'white', // Conditional background color
        color: props.mode === 'dark' ? 'white' : 'black' // Conditional text color
      }} >
        
        <form onSubmit={onSubmit}>
        <h2 className='h2' style={{color: props.mode === 'dark' ? 'white' : 'black' }}>Reset Password</h2>

          <div className="form-group">
          
            <div className="input-icon">
              <FontAwesomeIcon icon={faKey}  style={{color: props.mode === 'dark' ? 'white' : 'black',marginTop:'7px',fontSize:'30px' }} className="input-icon" />
              <input
                type="text"
                id="code"
                name="code"
                value={code}
                onChange={handleCodeChange}
                required
                className="form-control"
                placeholder="Enter your reset code"
              />
            </div>
          </div>

          <div className="form-group">
           
            <div className="input-icon">
              <FontAwesomeIcon style={{color: props.mode === 'dark' ? 'white' : 'black',marginTop:'-20px',fontSize:'30px' }} icon={faLock} className="input-icon" />
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={handlePasswordChange}
                required
                className="form-control"
                placeholder="Enter your new password"
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-light" style={{backgroundColor:props.mode === 'dark' ? 'white' : 'black',color: props.mode === 'dark' ? 'black' : 'white',border:'2px solid blue'}}
          >
            <FontAwesomeIcon icon={faCheck} className="me-2"  style={{color: props.mode === 'dark' ? 'white' : 'black' }}/> Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default Reset;
