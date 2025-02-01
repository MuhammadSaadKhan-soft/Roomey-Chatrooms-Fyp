import React from 'react';
import '../css/Message.css';


const UsersProfile = ({  profilePicture }) => {

console.log('usersprofile',profilePicture);
   

  return (
    <div>
      
        {profilePicture && <img src={profilePicture} alt="Profile" className="profilePicture" />}
        
    </div>
  );
};

export default UsersProfile;
