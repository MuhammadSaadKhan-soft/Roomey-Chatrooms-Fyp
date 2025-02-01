import React, { useState,useEffect,useContext } from 'react';
import { useNavigate } from 'react-router';
import { AxiosRequest } from '../Axios/AxiosRequest';
import image from "../images/chattingfriends.png";
import { AuthContext } from '../Contexts/AuthContext';
import {  faGithub} from '@fortawesome/free-brands-svg-icons';
import { faEnvelope, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'; 
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import "../css/login.css";
function Login({ showAlert, ...props }) {
  const { login } = useContext(AuthContext);
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  }); 
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false); // Loading state
  const navigate = useNavigate();

  const handleGithubLogin = async () => {
    try {
        const response = await AxiosRequest.get('/api/githubauth/auth/github');
        window.location.href = response.data.githubAuthUrl;
        navigate('create_room')
    
    } catch (error) {
        console.error('Error initiating GitHub login:', error);
     
    }
};




  const onChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const validateEmail = (email) => {
    const regex = /^[a-zA-Z0-9._%+-]+@(gmail|hotmail|yahoo|outlook|aol|icloud|live|msn)\.com$/i;
    return regex.test(email);
  };

  const validatePassword = (password) => {
    const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+}{":;'?\/><.,|`~\[\]\\\-]).{8,}$/;
    return regex.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (credentials.email === '' || credentials.password === '') {
      showAlert('Please fill in all fields', 'danger');
      return;
    }
    if (!validateEmail(credentials.email)) {
      showAlert('Please enter a valid email address', 'danger');
      return;
    }
    if (!validatePassword(credentials.password)) {
      showAlert('The password is invalid', 'danger');
      return;
    }
    setTimeout(()=>{
      setLoading(true);
    },7000)
    
  
    try {
      console.log("Sending login request with data:", credentials);
      const response = await AxiosRequest.post('/api/auth/login', {
        email: credentials.email,
        password: credentials.password
      });
  
      const data = response.data;
      console.log('Received data:', data);
  
      if (data.token && data.user) {
        localStorage.setItem('jwt', data.token);
        localStorage.setItem('userData', JSON.stringify(data.user));
        login(data.user, data.token);
        setTimeout(()=>{
          navigate('/create_room');
        },1000)
        
        showAlert('Successfully logged in!', 'success');
      } else {
        showAlert(data.error || 'An error occurred while logging in.', 'danger');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      if (error.response && error.response.status === 400) {
        showAlert(error.response.data.error || 'Invalid credentials. Please check your email and password.', 'danger');
      } else {
        showAlert('An unexpected error occurred. Please try again later.', 'danger');
      }
    } finally {
      setLoading(false);
    }
};

  

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };


  return (
    <div>
      {loading}
      
    <section className="p-3 p-md-4 p-xl-5">
      <div className="container">
        <div className="row">
          <div className="col-12 col-md-6 bsb-tpl-bg-platinum">
            <div className="d-flex flex-column justify-content-between h-100 p-3 p-md-4 p-xl-5">
              <h3 className="m-0" style={{ color: props.mode === 'dark' ? 'white' : 'black' }}>Welcome To Chat Roomey!</h3>
              
              <img className="img-fluid rounded mx-auto my-4" loading="lazy" src={image} width="600" height="200" alt="BootstrapBrain Logo" />
            </div>
          </div>
          <div className="col-12 col-md-6 bsb-tpl-bg-lotion">
            <div className="p-3 p-md-4 p-xl-5">
              <div className="row">
                <div className="col-12">
                  <div className="mb-5">
                    <h2 className="h3" style={{ color: props.mode === 'dark' ? 'white' : 'black' }}> </h2>
                  </div>
                </div>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="row gy-3 gy-md-4">
                <div className="col-12">
        <label htmlFor="email" style={{ color: props.mode === 'dark' ? 'white' : 'black' }}>
          Email
        </label>
        <div className="input-group">
          <span className="input-group-text">
            <FontAwesomeIcon style={{height:'35px'}} icon={faEnvelope} />
          </span>
          <input
            type="email"
            className="form-control"
            name="email"
            value={credentials.email}
            onChange={onChange}
            id="email"
            aria-describedby="emailHelp"
          />
        </div>
      </div>
                  <div className="col-12">
                      <label htmlFor="password" style={{ color: props.mode === 'dark' ? 'white' : 'black' }}>Password</label>
                      <div className="input-group">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={credentials.password}
                          onChange={onChange}
                          className="form-control"
                          id="password"
                        />
                        <button type="button"  style={{height:'49px',color:'black',backgroundColor:"whitesmoke"}} className="btn btn-light" onClick={togglePasswordVisibility}>
                          <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                        </button>
                      </div>
                    </div>
                  <div className="col-12">
                    <div className="d-grid">
                      <button  className="btn btn-light" style={{border:"2px solid blue",backgroundColor:'black',color: props.mode === 'dark' ? 'white' : 'white'}} type="submit"> {loading ? (
                            <FontAwesomeIcon icon={faSpinner} spin size="30px" className="me-22" />
                          ) : (
                            'Login'
                          )}</button>
                    </div>
                  </div>
                  <div className="col-12 text-end"> 
                  <p className={`${props.mode === 'light' ? 'text-dark' : 'text-light'} forgot-password`}>
  <a href="/forget-password" className="forgot-password-link">Forgot Password?</a>
</p>

                    </div>
                  <div className="col-12 text-end">
                  <button   className="btn btn-light" style={{border:"2px solid blue",backgroundColor:'black',color: props.mode === 'dark' ? 'white' : 'white'}} onClick={handleGithubLogin}>
                    <FontAwesomeIcon icon={faGithub} className="me-2" /> Login with GitHub
                </button>
            </div>
           
                 
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
  );
}

export default Login;