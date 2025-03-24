import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Profiles.css';

const ProfileForm = ({ profileId }) => {
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    emailAddress: '',
    profilePic: null,
    isJudge: false,
    category: '',
    bio: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (profileId) {
      axios.get(`http://localhost:4000/profiles/${profileId}`)
           .then(response => {
             const { first_name: firstName, last_name: lastName, email: emailAddress, photo: profilePic, is_judge: isJudge, category: category, bio: bio  } = response.data.profile;
             setProfile({ firstName, lastName, emailAddress, profilePic });
           })
           .catch(error => setError('Failed to load profile'));
       }
     }, [profileId]);

    const handleChange = (e) => {
      const { name, value, type, checked } = e.target;
      if (type === "checkbox") {
        setProfile((prevProfile) => ({
          ...prevProfile,
          [name]: checked
        }));
      } else if (name === "profilePic") {
        setProfile((prevProfile) => ({
          ...prevProfile,
          [name]: e.target.files[0]  // Handle file input change
        }));
      } else {
        setProfile((prevProfile) => ({
          ...prevProfile,
          [name]: value
        }));
      }
    };

     const handleSubmit = async (e) => {
       e.preventDefault();
       const formData = new FormData();
       formData.append('profile[first_name]', profile.firstName);
       formData.append('profile[last_name]', profile.lastName);
       formData.append('profile[email]', profile.emailAddress);
       if (profile.profilePic) {
         formData.append('profile[photo]', profile.profilePic);
       }
       formData.append('profile[is_judge]', profile.isJudge);
       formData.append('profile[category]', profile.category);
       formData.append('profile[bio]', profile.bio);
      
       try {
         const url = profileId ? `http://localhost:4000/profiles/${profileId}` : `http://localhost:4000/profiles`;
         const method = profileId ? 'put' : 'post';
         const response = await axios[method](url, formData, {
           headers: {
             'Content-Type': 'multipart/form-data',
           },
         });
         console.log('Profile saved:', response.data);
         localStorage.setItem('profile_id', response.data.profile.id);
         setSuccess(true);
         navigate('/');
       } catch (error) {
         setError('An error occurred. Please try again.');
         console.error(error);
       }
     };

     return (
       <div className="container">
         <h1>{profileId ? 'Edit Profile' : 'Create Profile'}</h1>
         {error && <p style={{ color: 'red' }}>{error}</p>}
         {success && <p style={{ color: 'green' }}>Profile submitted successfully</p>}
         <form onSubmit={handleSubmit}>
           <div className="form-group">
             <label>First Name</label>
             <input
               type="text"
               name="firstName"
               className="form-control"
               value={profile.firstName}
               onChange={handleChange}
             />
           </div>
           <div className="form-group">
             <label>Last Name</label>
             <input
               type="text"
               name="lastName"
               className="form-control"
               value={profile.lastName}
               onChange={handleChange}
             />
           </div>
           <div>
             <label>Profile Picture</label>
             <input
               type="file"
               name="profilePic"
               className="form-control"
               accept="image/*"
               onChange={handleChange}
             />
           </div>
           <div className="form-group">
            <label>
              Would you like to be a judge?
              <br />  {/* Optional: break line for better readability */}
              <div style={{ marginTop: '5px', marginRight: '1050px' }}>
                  <input
                    type="checkbox"
                    name="isJudge"
                    checked={profile.isJudge}
                    onChange={handleChange}
                  />
              </div>
           </label>
          </div>
            {profile.isJudge && (
              <div className="judge-details">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    name="category"
                    className="form-control"
                    value={profile.category}
                    onChange={handleChange}
                  >
                    <option value="">Select a category</option>
                    <option value="fitness">Fitness</option>
                    <option value="music">Music</option>
                    <option value="software">Software</option>
                    <option value="software">Art</option>
                    {/* More categories as needed */}
                  </select>
                </div>
                <div className="form-group">
                  <label>Bio</label>
                  <textarea
                    name="bio"
                    className="form-control"
                    value={profile.bio}
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}
           <button type="submit" className="btn btn-primary">{profileId ? 'Update' : 'Submit'}</button>
         </form>
       </div>
     );
   };

   export default ProfileForm;