import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AxiosRequest } from '../Axios/AxiosRequest';
import { faEye, faEyeSlash, faUser, faEnvelope, faInfoCircle, faTag } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import registrationImage from '../images/chattingfriends.png';
 import "../css/Registration.css";
function Registration({ showAlert, mode }) {
    const [credentials, setCredentials] = useState({
        name: '',
        email: '',
        password: '',
        cpassword: '',
        image: null,          
        interest: []    
    });
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const onChange = (e) => {
        if (e.target.name === 'image') {
            setCredentials({ ...credentials, [e.target.name]: e.target.files[0] });
        }else if (e.target.name === 'interest') {
            setCredentials({ ...credentials, [e.target.name]: e.target.value.split(',') }); // Convert comma-separated string to array
        }
         else {
            setCredentials({ ...credentials, [e.target.name]: e.target.value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (credentials.name.trim() === '' || credentials.email.trim() === '' || credentials.password.trim() === '' || credentials.cpassword.trim() === '') {
            showAlert('Please fill in all fields', 'danger');
            return;
        }

        if (credentials.password !== credentials.cpassword) {
            showAlert('Password and Confirm Password do not match', 'danger');
            return;
        }

        if (!validateEmail(credentials.email)) {
            showAlert('Please enter a valid email address', 'danger');
            return;
        }

        if (!validatePassword(credentials.password)) {
            showAlert('Password must contain at least one lowercase letter, one uppercase letter, one numeric digit, and one special character', 'danger');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('name', credentials.name);
            formData.append('email', credentials.email);
            formData.append('password', credentials.password);
           
            formData.append('interest', credentials.interest.join(','));
            if (credentials.image) {
                formData.append('profilePicture', credentials.image);
            }

            const response = await AxiosRequest.post('http://localhost:5000/api/auth/createUser', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const data = response.data;
            if (data.success && data.token && data.user) {
                localStorage.setItem('jwt', data.token);
                localStorage.setItem('userData', JSON.stringify(data.user));
                setTimeout(()=>{
                    navigate('/create_room');
                },1000)
               
                showAlert('Successfully registered and logged in!', 'success');
            } else {
                showAlert(data.message || 'This Email already exists', 'danger');
            }
        } catch (error) {
            if (error.response) {
                // Server responded with a status other than 2xx
                console.error('Error response:', error.response.data);
                console.error('Error status:', error.response.status);
                console.error('Error headers:', error.response.headers);
            } else if (error.request) {
                // Request was made but no response received
                console.error('Error request:', error.request);
            } else {
                // Something happened in setting up the request
                console.error('Error message:', error.message);
            }
            showAlert('An unexpected error occurred. Please try again later.', 'danger');
        }
        
    };

    const validateEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    const validatePassword = (password) => {
        const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+}{":;'?\/><.,|`~\[\]\\\-]).{8,}$/;
        return regex.test(password);
    };

   
    return (
        <div>
        <form onSubmit={handleSubmit}>
            <section className="p-3 p-md-4 p-xl-5">
                <div className="container" >
                    <div className="row" style={{marginTop:'-50px'}}>
                        <div className="col-12 col-md-6 bsb-tpl-bg-platinum d-flex justify-content-center align-items-center" >
                            <img src={registrationImage} style={{ maxWidth: '100%', height: 'auto' }} alt="Registration" className="img-fluid" />
                        </div>
                        <div className="col-12 col-md-6 bsb-tpl-bg-lotion" >
                            <div className="p-3 p-md-4 p-xl-5">
                                <div className="row">
                                    <div className="col-12">
                                        <div className="mb-5">
                                            <p style={{ color: mode === "dark" ? "#f8f9fa" : "#343a40", marginTop: "-1rem", fontSize: "1.2rem",marginLeft:'-650px' }}>
                                                Welcome to <strong>Chat Roomey</strong>
                                            </p>
                                            <h3 className="fs-6 fw-normal text-secondary" style={{ color: mode === "dark" ? "#f8f9fa" : "#343a40", marginTop: "-10px", fontSize: "1.2rem" }}>Enter your details to register</h3>
                                        </div>
                                    </div>
                                </div>
                                <div className="row gy-3 gy-md-4 overflow-hidden">
                                    <div className="col-12" >
                                        <label htmlFor="name" style={{ color: mode === "dark" ? "white" : "black", fontWeight: "normal" }}>Name <span className="text-danger">*</span></label>
                                        <div className="input-group align-items-center">
                                            <span className="input-group-text icon-size">
                                                <FontAwesomeIcon icon={faUser} />
                                            </span>
                                            <input type="text" className="form-control input-height" name="name" value={credentials.name} onChange={onChange} id="name" />
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <label htmlFor="email" style={{ color: mode === 'dark' ? 'white' : 'black' }}>Email <span className="text-danger">*</span></label>
                                        <div className="input-group align-items-center">
                                            <span className="input-group-text icon-size">
                                                <FontAwesomeIcon icon={faEnvelope} />
                                            </span>
                                            <input
                                                type="email"
                                                className="form-control input-height"
                                                name="email"
                                                value={credentials.email}
                                                onChange={onChange}
                                                id="email"
                                                aria-describedby="emailHelp"
                                            />
                                        </div>
                                    </div>
                                 
                                    <div className="col-12">
                                        <label htmlFor="interest" style={{ color: mode === "dark" ? "white" : "black", fontWeight: "normal" }}>Interest (comma-separated)</label>
                                        <div className="input-group align-items-center">
                                            <span className="input-group-text icon-size">
                                                <FontAwesomeIcon icon={faTag} />
                                            </span>
                                            <input
                                                type="text"
                                                className="form-control input-height"
                                                name="interest"
                                                value={credentials.interest.join(',')}
                                                onChange={onChange}
                                                id="interest"
                                            />
                                        </div>
                                    </div>
                                  <div className="col-12">
    <label htmlFor="password" style={{ color: mode === 'dark' ? 'white' : 'black' }}>Password</label>
    <div className="input-group align-items-center">
        <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={credentials.password}
            onChange={onChange}
            className="form-control input-height"
            id="password"
        />
      
    </div>
</div>

                                    <div className="col-12">
                                        <label htmlFor="cpassword" style={{ color: mode === 'dark' ? 'white' : 'black' }}>Confirm Password</label>
                                        <div className="input-group align-items-center">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                name="cpassword"
                                                value={credentials.cpassword}
                                                onChange={onChange}
                                                className="form-control input-height"
                                                id="cpassword"
                                            />
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <label htmlFor="image" style={{ color: mode === 'dark' ? 'white' : 'black' }}>Profile Picture</label>
                                        <input
                                            style={{height:'50px'}}
                                            type="file"
                                            name="image"
                                            className="form-control input-height"
                                            id="image"
                                            onChange={onChange}
                                        />
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <button type="submit" className="btn btn-light" style={{border:'2px solid blue',backgroundColor:'black',color: mode === 'dark' ? 'white' : 'white'}}>Register</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </form>
    </div>
    );
}

export default Registration;
