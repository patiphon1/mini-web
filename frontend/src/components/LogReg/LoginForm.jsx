import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './LoginPage.css';

function LoginForm() {
    const [formData, setFormData] = useState({
        identifier: '',
        password: ''
    });
    const [message, setMessage] = useState('');
    const [attempts, setAttempts] = useState(0);
    const [isLocked, setIsLocked] = useState(false);
    const [lockoutTimer, setLockoutTimer] = useState(0);
    const navigate = useNavigate();

    const MAX_ATTEMPTS = 3; // Maximum allowed login attempts
    const LOCKOUT_DURATION = 10; // Lockout duration in seconds

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

        try {
            const response = await axios.post('http://localhost:5000/api/auth/login', formData);
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', response.data.user._id);
                setAttempts(0)
                navigate('/dashboard');
            }
        } catch (err) {
             if (attempts + 1 >= MAX_ATTEMPTS) {
                setIsLocked(true);
                setLockoutTimer(LOCKOUT_DURATION);
                setMessage(`Too many attempts. Account locked for ${LOCKOUT_DURATION} seconds.`);
                setAttempts(0)

            } else {
                 setMessage(err.response?.data?.error || 'Login failed');
                 setAttempts((prevAttempt) => prevAttempt + 1);
             }
        }
    };

    return (
        <div className='body-login'>
            <div className="screen-1">
                <h3>Login</h3>
                {message && <p className='error-message'>{message}</p>}
                 {isLocked && <p className='warning-message'>Account locked for {lockoutTimer} seconds.</p>}
                <form onSubmit={handleSubmit}>
                    <div className="input-btn">
                        <label htmlFor="identifier">Username/Email</label><br />
                        <input
                            type="text"
                            name="identifier"
                            placeholder="Username or Email"
                            value={formData.identifier}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="input-btn">
                        <label htmlFor="password">Password</label><br />
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button type="submit" className='input-btn-submit' disabled={isLocked}>Login</button>
                </form>
                <p>Don't have an account? <Link to="/register">Register here</Link></p>
                <Link to="/forgot-password">Forget Password?</Link>
            </div>
        </div>
    );
}

export default LoginForm;
