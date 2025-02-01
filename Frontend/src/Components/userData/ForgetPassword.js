import React, { useState } from 'react';
import { AxiosRequest } from '../Axios/AxiosRequest';
import { useNavigate } from 'react-router';
import '../css/ForgetPassword.css'; // Import your CSS file

const ForgetPassword = (props) => {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleForgetPasswordSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await AxiosRequest.post(
        '/api/auth/forget-password',
        { email }
      );
      const data = response.data;
     
      if (data.status === 'success') {
        localStorage.setItem('Email', email);
        alert(data.message);
        navigate('/reset-password')
      } else if (data.status === 'user not found') {
        alert('User not found. Please enter a valid email address.');
      } else {
        alert(data.message || 'An error occurred while processing your request.');
      }
    } catch (error) {
      console.error('Error submitting email:', error);
      alert('An unexpected error occurred. Please try again later.');
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  return (
    <div className="forget-password-container" > {/* Container div with custom CSS class */}
      <div className="forget-password-form"  style={{ 
        backgroundColor: props.mode === 'dark' ? 'black' : 'white', // Conditional background color
        color: props.mode === 'dark' ? 'white' : 'black' // Conditional text color
      }} > {/* Form div */}
        <h2 style={{color: props.mode === 'dark' ? 'white' : 'black' }}>Forget Password</h2>
        <form onSubmit={handleForgetPasswordSubmit}>
          <div className="form-group">
            <label htmlFor="email" style={{color: props.mode === 'dark' ? 'white' : 'black' }}>Email Address</label>
            <input
              type="email"
              className="form-control"
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={handleEmailChange}
              required
            />
          </div>
          <button type="submit" className="btn btn-light" style={{backgroundColor:props.mode === 'dark' ? 'white' : 'black',color: props.mode === 'dark' ? 'black' : 'white',border:"3px solid blue"}}>
  Submit
</button>

        </form>
      </div>
    </div>
  );
};

export default ForgetPassword;