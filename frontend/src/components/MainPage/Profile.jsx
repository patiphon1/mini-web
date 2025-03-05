import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar';
import './dashboard.css'; // Import the CSS file

function UpdateProfile() {
    const [profileData, setProfileData] = useState(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [showPasswordForm, setShowPasswordForm] = useState(false); // State to toggle password form visibility
    const [showPictureForm, setShowPictureForm] = useState(false); // New state to toggle picture form visibility
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const defaultProfileUrl = 'http://localhost:5000/uploads/default-profile.png';

    // Temporary state to hold changes before submit
    const [tempProfilePicture, setTempProfilePicture] = useState(null);
    const [tempCurrentPassword, setTempCurrentPassword] = useState('');
    const [tempNewPassword, setTempNewPassword] = useState('');
    const [tempConfirmNewPassword, setTempConfirmNewPassword] = useState('');

    // Function to refresh the user data
    const refreshUserData = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/protected', {
                headers: {
                    'x-auth-token': token,
                },
            });
            setProfileData(response.data);
        } catch (error) {
            console.error('Error fetching profile data:', error);
        }
    };

    useEffect(() => {
        refreshUserData();
    }, [token]);

    const handleFileChange = (e) => {
        setTempProfilePicture(e.target.files[0]);
    };

    const handleUpdatePicture = async () => {
        setMessage('');
        setError('');

        const formData = new FormData();
        if (tempProfilePicture) {
            formData.append('profilePicture', tempProfilePicture);
        } else {
            return;
        }

        try {
            const res = await axios.put(
                'http://localhost:5000/api/users/update-picture', // ✅ Correct endpoint
                formData,
                {
                    headers: {
                        'x-auth-token': token,
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            setMessage(res.data.message);
            setProfileData({ ...profileData, user: { ...profileData.user, profilePicture: res.data.user.profilePicture } });
            setTempProfilePicture(null);
            setShowPictureForm(false); // Hide the form after successful update
            refreshUserData();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile.');
        }
    };

    const handleUpdatePassword = async () => {
        setMessage('');
        setError('');

        if (tempNewPassword !== tempConfirmNewPassword) {
            setError('New passwords do not match.');
            return;
        }

        const formData = new FormData();
        formData.append('currentPassword', tempCurrentPassword);
        formData.append('newPassword', tempNewPassword);

        try {
            const res = await axios.put(
                'http://localhost:5000/api/users/update-password', // ✅ Correct endpoint
                formData,
                {
                    headers: {
                        'x-auth-token': token,
                    },
                }
            );
            setMessage(res.data.message);
            setTempCurrentPassword('');
            setTempNewPassword('');
            setTempConfirmNewPassword('');
            setShowPasswordForm(false); // Hide the form after successful update
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update password.');
        }
    };

    const togglePasswordForm = () => {
        setShowPasswordForm(!showPasswordForm);
    };

    const togglePictureForm = () => {
        setShowPictureForm(!showPictureForm);
    };

    return (
        <div>
            <Navbar profileData={profileData} />
            <div className="container max-w-3xl mx-auto">
                <div className='profile-container'>
                    <h2 className="profile-title">Update Profile</h2>
                    <div className='profile-picture-container'>
                        <img
                            src={profileData?.user?.profilePicture ? `http://localhost:5000${profileData.user.profilePicture}` : defaultProfileUrl}
                            alt="Profile"
                            className="profile-picture-update"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = defaultProfileUrl;
                            }}
                        />
                    </div>
                    <div className='profile-update-picture'>
                        {/* Button to show/hide the picture form */}
                        <button onClick={togglePictureForm} className="profile-button">
                            {showPictureForm ? 'Hide Picture Form' : 'Change Profile Picture'}
                        </button>

                        {/* Conditionally render the picture form */}
                        {showPictureForm && (
                            <div className='picture-form container1 box-password'>
                                <label htmlFor="profilePicture"></label>
                                <input
                                    type="file"
                                    id="profilePicture"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                                <button onClick={handleUpdatePicture} className="profile-button">Update Picture</button>
                            </div>
                        )}
                    </div>
                    <div className='profile-update-password'>
                        <button onClick={togglePasswordForm} className="profile-button">
                            {showPasswordForm ? 'Hide Password Form' : 'Change Password'}
                        </button>
                        {showPasswordForm && (
                            <div className='profile-form container1 box-password'>
                                <div>
                                    <label htmlFor="currentPassword">Current Password:</label>
                                    <input
                                        type="password"
                                        id="currentPassword"
                                        value={tempCurrentPassword}
                                        onChange={(e) => setTempCurrentPassword(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="newPassword">New Password:</label>
                                    <input
                                        type="password"
                                        id="newPassword"
                                        value={tempNewPassword}
                                        onChange={(e) => setTempNewPassword(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="confirmNewPassword">Confirm New Password:</label>
                                    <input
                                        type="password"
                                        id="confirmNewPassword"
                                        value={tempConfirmNewPassword}
                                        onChange={(e) => setTempConfirmNewPassword(e.target.value)}
                                    />
                                </div>

                                <button onClick={handleUpdatePassword} className="profile-button">Update Password</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UpdateProfile;
