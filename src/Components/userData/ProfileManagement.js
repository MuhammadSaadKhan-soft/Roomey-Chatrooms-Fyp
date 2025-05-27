import React, { useState, useEffect } from 'react';
import { AxiosRequest } from '../Axios/AxiosRequest';
import '../css/ProfileManagement.css';  // Custom CSS file for styling

function ProfileManagement({themes}) {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    password: '',
    cpassword: '',
    bio: '',
    interest: '',
    profilePicture: ''
  });
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [newProfilePicture, setNewProfilePicture] = useState(null);
  const token = sessionStorage.getItem('jwt');

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const fetchUserData = async () => {
    if (!token) throw new Error('No token found');
    setLoading(true);
    try {
      const response = await AxiosRequest.get('http://localhost:8080/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = response.data;

      setTimeout(() => {
        setUserData({
          name: data.name,
          email: data.email,
          bio: data.bio || `No bio provided by ${data.name}`,
          interest: data.interest || `No interest provided by ${data.name}`,
          profilePicture: data.profilePicture || ''
        });
      }, 1000);

      setImagePreview(data.profilePicture || '');
    } catch (error) {
      console.error('Error fetching user data:', error.response ? error.response.data : error.message);
    } finally {
      setLoading(false);
    }
  };

  const onChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const onImageChange = (e) => {
    const file = e.target.files[0];
    setUserData({ ...userData, profilePicture: file });
    setNewProfilePicture(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {};

    if (!userData.name) {
      newErrors.name = "Name is required";
      isValid = false;
    }
    if (!userData.email) {
      newErrors.email = "Email is required";
      isValid = false;
    }
    if (userData.password && userData.password !== userData.cpassword) {
      newErrors.cpassword = "Passwords do not match";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const formData = new FormData();
    formData.append('name', userData.name);
    formData.append('email', userData.email);
    formData.append('password', userData.password);
    formData.append('bio', userData.bio);
    formData.append('interest', userData.interest);
    if (newProfilePicture) {
      formData.append('profilePicture', newProfilePicture);
    }

    setLoading(true);
    try {
      const response = await AxiosRequest.patch('/api/auth/updateuser', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
      });

      const data = response.data;
      if (data.user) {
        localStorage.setItem('userData', JSON.stringify(data.user));
        alert('Profile updated successfully!');
        setUserData({
          ...userData,
          profilePicture: data.user.profilePicture
        });
        setImagePreview(data.user.profilePicture);
      } else {
        alert('Failed to update profile.');
      }
    } catch (error) {
      console.error('Error updating user data:', error.message);
      alert('Error updating profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={` ${themes}?'dark-mode':'light-mode ' container py-5`}>
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          {/* Profile Picture */}
          <div className="profile-management__image-container text-center mb-4">
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Profile Preview"
                className="profile-management__image img-fluid rounded-circle"
                style={{ maxWidth: '150px' }}
              />
            )}
          </div>

          {/* Loading Indicator */}
          {loading && <p className="profile-management__loading-text">Loading...</p>}

          {/* Form */}
          <form onSubmit={handleSubmit} className="profile-management__form">
            {/* Name Input */}
            <div className="profile-management__form-group mb-3">
              <label htmlFor="name" className={`profile-management__label ${themes?'text-white':'text-dark'} `}>Name</label>
              <input
                type="text"
                name="name"
                value={userData.name || ''}
                onChange={onChange}
                className="profile-management__input form-control"
              />
              {errors.name && <div className="profile-management__error-text text-danger">{errors.name}</div>}
            </div>

            {/* Email Input */}
            <div className="profile-management__form-group mb-3">
              <label htmlFor="email" className={`profile-management__label ${themes?'text-white':'text-dark'}`}>Email</label>
              <input
                type="email"
                name="email"
                value={userData.email || ''}
                onChange={onChange}
                className="profile-management__input form-control"
              />
              {errors.email && <div className="profile-management__error-text text-danger">{errors.email}</div>}
            </div>

            {/* Bio Input */}
            <div className="profile-management__form-group mb-3">
              <label htmlFor="bio" className={`profile-management__label ${themes?'text-white':'text-dark'}`}>Bio</label>
              <textarea
                name="bio"
                value={userData.bio || ''}
                onChange={onChange}
                className="profile-management__input form-control"
              ></textarea>
            </div>

            {/* Interest Input */}
            <div className="profile-management__form-group mb-3">
              <label htmlFor="interest" className={`profile-management__label ${themes?'text-white':'text-dark'}`}>Interest</label>
              <input
                type="text"
                name="interest"
                value={userData.interest || ''}
                onChange={onChange}
                className="profile-management__input form-control"
              />
            </div>

            {/* Profile Picture Input */}
            <div className="profile-management__form-group mb-3">
              <label htmlFor="profilePicture" className={`profile-management__label ${themes?'text-white':'text-dark'}`}>Profile Image</label>
              <input
                type="file"
                name="profilePicture"
                onChange={onImageChange}
                className="profile-management__input form-control"
              />
            </div>

            {/* Submit Button */}
            <button type="submit" className="profile-management__submit-btn btn btn-dark  w-100">Update Profile</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ProfileManagement;
