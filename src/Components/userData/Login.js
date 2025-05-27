import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router';
import { AxiosRequest } from '../Axios/AxiosRequest';
import image from "../images/chattingfriends.png";
import { AuthContext } from '../Contexts/AuthContext';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';

function Login({ showAlert,themes,toggleMode}) {
  const { login } = useContext(AuthContext);
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGithubLogin = async () => {
    try {
      const response = await AxiosRequest.get('/api/githubauth/auth/github');
      window.location.href = response.data.githubAuthUrl;
      navigate('create_room');
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
    setLoading(true);

    try {
      const response = await AxiosRequest.post('/api/auth/login', {
        
        email: credentials.email,
        password: credentials.password
      });
      

      const data = response.data;
      if (data.token && data.user) {
        localStorage.setItem('jwt', data.token);
        localStorage.setItem('userData', JSON.stringify(data.user));
        login(data.user, data.token);
        setTimeout(() => {
          navigate('/create_room');
        }, 1000);

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
    <div className={`${themes ? 'dark-mode' : 'light-mode'}`}>
     

      <section className={` ${themes ? 'dark-mode' : 'light-mode'} p-3 p-md-4 p-xl-5`}>
        <div className="container">
          <div className="row">
            {/* Left Section */}
            <div className="col-12 col-md-6 d-flex flex-column justify-content-between align-items-center p-3 p-md-4 p-xl-5 bg-light">
              <h3 className="text-center" style={{ color: themes === 'dark' ? 'white' : 'black' }}>
                Welcome To Chat Roomey!
              </h3>
              <img className="img-fluid rounded mx-auto my-4" loading="lazy" src={image} alt="Chat Image" />
            </div>

            {/* Right Section */}
            <div className="col-12 col-md-6 p-3 p-md-4 p-xl-5 ">
              <form onSubmit={handleSubmit}>
                {/* Email Field */}
                <div className="mb-3">
                  <label htmlFor="email" className="form-label" style={{ color: themes === 'dark' ? 'white' : 'black' }}>
                    Email
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <FontAwesomeIcon style={{ height: '35px' }} icon={faEnvelope} />
                    </span>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={credentials.email}
                      onChange={onChange}
                      id="email"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="mb-3">
                  <label htmlFor="password" className="form-label" style={{ color: themes === 'dark' ? 'white' : 'black' }}>
                    Password
                  </label>
                  <div className="input-group">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={credentials.password}
                      onChange={onChange}
                      className="form-control"
                      id="password"
                    />
                    <button type="button" className="btn btn-light" onClick={togglePasswordVisibility}>
                      <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                    </button>
                  </div>
                </div>

                {/* Login Button */}
               <div className="d-grid mb-3">
    <button
      className="btn btn-dark"
      type="submit"
      disabled={loading}
    >
      {loading ? (
        <FontAwesomeIcon icon={faSpinner} spin size="sm" />
      ) : (
        'Login'
      )}
    </button>
  </div>

                {/* Forgot Password Link */}
                <div className="text-end">
                  <p>
                    <Link to="/forget-password" className="text-decoration-none">
                      Forgot Password?
                    </Link>
                  </p>
                </div>

                {/* GitHub Login Button */}
                <div className="text-end">
                  <button className="btn btn-dark" onClick={handleGithubLogin}>
                    <FontAwesomeIcon icon={faGithub} className="me-2" /> Login with GitHub
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Login;
