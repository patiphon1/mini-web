import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

function RegisterForm() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        pin: ''
    });
    const [message, setMessage] = useState('');
    const [attempts, setAttempts] = useState(0);
    const [isLocked, setIsLocked] = useState(false);
    const [lockoutTimer, setLockoutTimer] = useState(0);
    const navigate = useNavigate();

    const MAX_ATTEMPTS = 3; // Maximum allowed registration attempts
    const LOCKOUT_DURATION = 5; // Lockout duration in seconds

    useEffect(() => {
        let timer;
        if (isLocked && lockoutTimer > 0) {
            timer = setInterval(() => {
                setLockoutTimer((prevTimer) => prevTimer - 1);
            }, 1000);
        } else if (isLocked && lockoutTimer === 0) {
            setIsLocked(false);
            setAttempts(0);
            setMessage("You can try again now.");
        }

        return () => clearInterval(timer);
    }, [isLocked, lockoutTimer]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isLocked) {
            setMessage(`Too many attempts. Please wait ${lockoutTimer} seconds.`);
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setMessage('Invalid email format.');
            return;
        }

        // Password
        const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]).{8,}$/;
        if (!passwordRegex.test(formData.password)) {
            setMessage(
                'Password must be at least 8 characters long and contain at least one uppercase letter and one special character.'
            );
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setMessage('Passwords do not match');
            return;
        }

        if (!formData.pin.trim()) {
            setMessage('Please provide a PIN.');
            return;
        }

        try {
            const res = await axios.post('http://localhost:5000/api/auth/register', formData);

            if (res && res.data) {
                setMessage(res.data.message);
                setAttempts(0)
                setTimeout(() => navigate('/loginForm'), 1000);
            } else {
                setMessage('Unexpected server response');
            }
        } catch (error) {
             if (attempts + 1 >= MAX_ATTEMPTS) {
                setIsLocked(true);
                setLockoutTimer(LOCKOUT_DURATION);
                setMessage(`Too many attempts. Account locked for ${LOCKOUT_DURATION} seconds.`);
                setAttempts(0)

            } else {
                 setMessage(error.response?.data?.message || 'Server error');
                 setAttempts((prevAttempt) => prevAttempt + 1);
             }
        }
    };

    return (
        <div className='body-register'>
            <div className="screen-1">
                <h3>Register</h3>
                {message && <p className='error-message'>{message}</p>}
                {isLocked && <p className='warning-message'>Account locked for {lockoutTimer} seconds.</p>}
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
                        <label htmlFor="confirmPassword">Confirm Password </label><br />
                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirm Password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>
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

                    <button type="submit" className='input-btn-submit' disabled={isLocked}>Register</button>
                </form>
                <p>Already have an account? <a href="/loginForm">Login here</a></p>
            </div>
        </div>
    );
}

export default RegisterForm;
