import React, { useState } from 'react';
import {Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [pin, setPin] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        try {
            const response = await axios.post('http://localhost:5000/api/auth/forgot-password', {
                email,
                pin,
                newPassword
            });
            setMessage(response.data.message);
            // clear form
            setEmail('');
            setPin('');
            setNewPassword('');
            setTimeout(() => {
                navigate('/loginForm');
            }, 1500)
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to reset password.');
        }
    };

    return (
        <div className="body-login">
            <div className="screen-1">
                <h2>Forgot Password</h2>
                {message && <div className="message">{message}</div>}
                {error && <div className='alert alert-danger'>{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="input-btn">
                        <label htmlFor='email'>Email</label>
                        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="input-btn">
                        <label htmlFor='pin'>PIN</label>
                        <input type="password" placeholder="PIN" value={pin} onChange={(e) => setPin(e.target.value)} required />
                    </div>
                    <div className="input-btn">
                        <label htmlFor='newPassword'>New Password</label>
                        <input type="password" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                    </div>
                    <button type="submit" className="input-btn-submit">Reset Password</button>
                    <p>Go back to Login?<Link to="/loginForm">Login</Link></p>
                </form>
                
            </div>
        </div>
    );
}

export default ForgotPassword;
