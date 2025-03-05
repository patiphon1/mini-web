import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css'

function RegisterForm() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        pin: '' // Add pin
    });
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            setMessage('Passwords do not match');
            return;
        }
        // Check if pin is empty
        if (!formData.pin.trim()) {
            setMessage('Please provide a PIN.');
            return;
        }

        try {
            const res = await axios.post('http://localhost:5000/api/auth/register', formData);

            if (res && res.data) {  // ✅ ตรวจสอบ res และ res.data ก่อนใช้
                setMessage(res.data.message);
                setTimeout(() => navigate('/loginForm'), 1000);
            } else {
                setMessage('Unexpected server response');
            }
        } catch (error) {
            setMessage(error.response?.data?.message || 'Server error');
        }
    };


    return (
        <div className='body-register'>
            <div className="screen-1">
                <h3>Register</h3>
                {message && <p>{message}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="input-btn">
                        <label htmlFor="identifier">Username </label><br />

                        <input
                            type="text"
                            name="username"
                            placeholder="Username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="input-btn">
                        <label htmlFor="email">Email </label><br />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="input-btn">
                        <label htmlFor="password">Password </label><br />
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="input-btn">
                        <label htmlFor="confirmPassword">ConfirmPassword </label><br />
                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirm Password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    {/* add pin here */}
                    <div className="input-btn">
                        <label htmlFor="pin">PIN(For forgot password) </label><br />
                        <input
                            type="text"
                            name="pin"
                            placeholder="Create PIN"
                            value={formData.pin}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button type="submit" className='input-btn-submit'>Register</button>
                </form>
                <p>Already have an account? <a href="/loginForm">Login here</a></p>
            </div>
        </div>
    );
}

export default RegisterForm;
