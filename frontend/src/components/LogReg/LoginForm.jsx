import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './LoginPage.css';
function LoginForm() {
    const [formData, setFormData] = useState({
        identifier: '',
        password: ''
    });
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/auth/login', formData);
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', response.data.user._id);
                navigate('/dashboard');
            }
        } catch (err) {
            setMessage(err.response?.data?.error || 'Login failed');
        }
    };

    return (
        <div className='body-login'>
            <div className="screen-1">
                <h3>Login</h3>
                {message && <p>{message}</p>}
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
                    <button type="submit" className='input-btn-submit'>Login</button>
                </form>
                <p>Don't have an account? <Link to="/register">Register here</Link></p>
                <Link to="/forgot-password">Forget Password?</Link>
            </div>
        </div>
    );
}

export default LoginForm;
