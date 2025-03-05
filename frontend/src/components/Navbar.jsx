import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import "./Navbar.css";
import { FaComment, FaSearch } from 'react-icons/fa'; 

function Navbar({ profileData }) { // ✅ Receive profileData as props
    const [data, setData] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const defaultProfileUrl = 'http://localhost:5000/uploads/default-profile.png'; // URL to default profile image in the backend

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/loginForm');
    }

    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!profileData) { // ✅ Fetch only if profileData is not passed
            axios
                .get('http://localhost:5000/api/protected', {
                    headers: {
                        'x-auth-token': token,
                    },
                })
                .then((response) => {
                    setData(response.data);
                })
                .catch((error) => {
                    console.error('Error:', error.response?.data || error.message);
                });
        } else {
            setData(profileData); // ✅ Use profileData if it's passed in
        }
    }, [token, profileData]); // ✅ profileData is a dependency

    return (
        <nav className="navbar">
            <div className="container">
                {/* Logo */}
                <a href="/" className="logo">My Web</a>

                {/* Navigation Links */}
                <ul className="nav-links">
                    <li><Link to="/chat/new" className='chat-icon'><FaComment size={30} />Chat</Link></li>
                </ul>
                {/* Avatar & Dropdown */}
                <div className="avatar-container">
                    <button onClick={() => setIsOpen(!isOpen)} className="avatar-button">
                       {/* Display user image or default image */}
                        <img
                            src={data?.user?.profilePicture ? `http://localhost:5000${data.user.profilePicture}` : defaultProfileUrl}
                            alt="User Profile"
                            className="profile-picture"
                            onError={(e) => {
                                e.target.onerror = null; // Prevent infinite loop
                                e.target.src = defaultProfileUrl;
                            }}
                        />
                    </button>

                    {isOpen && (
                        <div className="dropdown-menu">
                            <p>{data?.user?.username || "Loading..."}</p>
                            <Link to="/profile">Settings</Link>
                            <a onClick={handleLogout}>Sign Out</a>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
