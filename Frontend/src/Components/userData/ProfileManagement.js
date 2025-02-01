import React, { useState, useEffect } from 'react';
import { AxiosRequest } from '../Axios/AxiosRequest';
import "../css/ProfileManagement.css";
function ProfileManagement({ mode }) {
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
    const [userRooms, setUserRooms] = useState({});

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
        const token = sessionStorage.getItem('jwt'); // Ensure token is stored correctly
        if (!token) throw new Error('No token found');
        setLoading(true);
        try {
            
            console.log('Fetching user data with token:', token);
            const response = await AxiosRequest.get('http://localhost:5000/api/auth/profile', {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log('User data fetched successfully:', response.data);
            const data = response.data;
           
            setTimeout(()=>{
                setUserData({
                    name: data.name,
                    email: data.email,
                    bio: data.bio || `No bio provided by Github User ${data.name}`,
                    interest: data.interest || `No interest provided by Github User ${data.name}`,
                    profilePicture: data.profilePicture || ''
                });
            },1000)
          
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
        const socketRef='http://localhost:5000';
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
            formData.append('profilePicture', newProfilePicture); // Field name should match
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
            console.log(data)
            if (data.user) {
                localStorage.setItem('userData', JSON.stringify(data.user));
                alert('Profile updated successfully!');
                setUserData({
                    ...userData,
                    profilePicture: data.user.profilePicture
                });
                setImagePreview(data.user.profilePicture);
            } else {
                console.error('Failed to update user data');
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
        <div className={`ProfileManagementPage`}>
        <div className="container py-5">
            <div className="profile-header" >
                {imagePreview && <img src={imagePreview} alt="Profile Preview" className="profile-img" />}
                </div>
           
            {loading && <p>Loading...</p>}
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="name" style={{color:'white'}}>Name</label>
                    <input type="text" name="name" value={userData.name || ''} onChange={onChange} className="form-control" />
                    {errors.name && <div className="text-danger">{errors.name}</div>}
                </div>
                <div className="mb-3">
                    <label htmlFor="email" style={{color:'white'}}>Email</label>
                    <input type="email" name="email" value={userData.email} onChange={onChange} className="form-control"  />
                    {errors.email && <div className="text-danger">{errors.email}</div>}
                </div>
               
                <div className="mb-3">
                    <label htmlFor="bio " style={{color:'white'}}>Bio</label>
                    <textarea name="bio" value={userData.bio} onChange={onChange} className="form-control"></textarea>
                </div>
                <div className="mb-3">
                    <label htmlFor="interest" style={{color:'white'}}>Interest</label>
                    <input type="text" name="interest" value={userData.interest} onChange={onChange} className="form-control" />
                </div>
                <div className="mb-3">
                    <label htmlFor="profilePicture" style={{color:'white'}}>Profile Image</label>
                    <input type="file" name="profilePicture" onChange={onImageChange} className="form-control" />
                </div>
                <button type="submit" className="btn btn-primary">Update Profile</button>
            </form>
        </div>
    </div>
    );
}

export default ProfileManagement;
