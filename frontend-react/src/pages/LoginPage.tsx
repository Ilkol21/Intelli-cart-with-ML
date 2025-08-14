// src/pages/LoginPage.tsx
import React, { useState, useContext, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { styles } from '../styles';

export function LoginPage() {
    const { setAuthToken } = useContext(AuthContext);
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const response = await axios.post('/api/auth/login', { email, password });
            setAuthToken(response.data.access_token, response.data.user);
            navigate('/lists');
        } catch (err: any) {
            console.error('Login failed:', err);
            setError(err.response?.data?.error || 'Login Failed!');
        }
    };

    return (
        <div>
            <h2>Login Page</h2>
            <form onSubmit={handleLogin} style={styles.form}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={styles.input}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={styles.input}
                />
                <button type="submit" style={styles.button}>Login</button>
                {error && <p style={{ color: 'red' }}>{error}</p>}
            </form>
        </div>
    );
}
