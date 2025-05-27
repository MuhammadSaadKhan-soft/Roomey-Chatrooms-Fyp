import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AxiosRequest } from '../Axios/AxiosRequest';
import { faEye, faEyeSlash, faUser, faEnvelope, faTag } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import registrationImage from '../images/chattingfriends.png';

function Registration({ showAlert,themes,toggleMode }) {
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
        } else if (e.target.name === 'interest') {
            setCredentials({ ...credentials, [e.target.name]: e.target.value.split(',') });
        } else {
            setCredentials({ ...credentials, [e.target.name]: e.target.value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!credentials.name || !credentials.email || !credentials.password || !credentials.cpassword) {
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

            const response = await AxiosRequest.post('http://localhost:8080/api/auth/createUser', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            const data = response.data;
            if (data.success && data.token && data.user) {
                localStorage.setItem('jwt', data.token);
                localStorage.setItem('userData', JSON.stringify(data.user));
                setTimeout(() => navigate('/create_room'), 1000);
                showAlert('Successfully registered and logged in!', 'success');
            } else {
                showAlert(data.message || 'This Email already exists', 'danger');
            }
        } catch (error) {
            showAlert('An unexpected error occurred. Please try again later.', 'danger');
        }
    };

    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const validatePassword = (password) =>
        /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+}{":;'?\/><.,|`~\[\]\\\-]).{8,}$/.test(password);

    return (
        <div className={`${themes ? 'dark-mode' : 'light-mode'}`}> 
            <form onSubmit={handleSubmit} >
                <section className="p-3 p-md-4 p-xl-5">
                    <div className="container">
                        <div className="row">
                            <div className="col-12 col-md-6 d-flex justify-content-center align-items-center">
                                <img src={registrationImage} alt="Registration" className="img-fluid" />
                            </div>
                            <div className="col-12 col-md-6">
                                <div className="p-3 p-md-4 p-xl-5">
                                    <div className="mb-5">
                                        <p className="text-dark mb-2" style={{ fontSize: '1.2rem' }}>
                                            Welcome to <strong>Chat Roomey</strong>
                                        </p>
                                        <h3 className="fs-6 fw-normal text-secondary mb-3" style={{ fontSize: '1.2rem' }}>
                                            Enter your details to register
                                        </h3>
                                    </div>

                                    <div className="row gy-3">
                                        <div className="col-12">
                                            <label htmlFor="name" className="form-label text-dark">
                                                Name <span className="text-danger">*</span>
                                            </label>
                                            <div className="input-group">
                                                <span className="input-group-text"><FontAwesomeIcon icon={faUser} /></span>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="name"
                                                    value={credentials.name}
                                                    onChange={onChange}
                                                    id="name"
                                                />
                                            </div>
                                        </div>

                                        <div className="col-12">
                                            <label htmlFor="email" className="form-label text-dark">
                                                Email <span className="text-danger">*</span>
                                            </label>
                                            <div className="input-group">
                                                <span className="input-group-text"><FontAwesomeIcon icon={faEnvelope} /></span>
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

                                        <div className="col-12">
                                            <label htmlFor="interest" className="form-label text-dark">
                                                Interest (comma-separated)
                                            </label>
                                            <div className="input-group">
                                                <span className="input-group-text"><FontAwesomeIcon icon={faTag} /></span>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="interest"
                                                    value={credentials.interest.join(',')}
                                                    onChange={onChange}
                                                    id="interest"
                                                />
                                            </div>
                                        </div>

                                        <div className="col-12">
                                            <label htmlFor="password" className="form-label text-dark">
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
                                            </div>
                                        </div>

                                        <div className="col-12">
                                            <label htmlFor="cpassword" className="form-label text-dark">
                                                Confirm Password
                                            </label>
                                            <div className="input-group">
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    name="cpassword"
                                                    value={credentials.cpassword}
                                                    onChange={onChange}
                                                    className="form-control"
                                                    id="cpassword"
                                                />
                                            </div>
                                        </div>

                                        <div className="col-12">
                                            <label htmlFor="image" className="form-label text-dark">
                                                Profile Picture
                                            </label>
                                            <input
                                                type="file"
                                                name="image"
                                                className="form-control"
                                                id="image"
                                                onChange={onChange}
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <button type="submit" className="btn btn-dark w-100">Register</button>
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
