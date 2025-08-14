// src/pages/RegisterPage.tsx
import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { styles } from '../styles';

// Компонент для коректного відображення помилок
function ErrorDisplay({ error }: { error: any }) {
    if (!error) return null;

    // Якщо це помилка валідації від Laravel (об'єкт з масивами)
    if (typeof error === 'object' && !error.message) {
        return (
            <>
                {Object.values(error).map((err: any, index) => (
                    <p key={index} style={{ color: 'red' }}>
                        {Array.isArray(err) ? err[0] : String(err)}
                    </p>
                ))}
            </>
        );
    }

    // Якщо це загальна помилка (об'єкт з полем message)
    if (error.message) {
        return <p style={{ color: 'red' }}>{error.message}</p>;
    }

    // Запасний варіант
    return <p style={{ color: 'red' }}>An unknown error occurred.</p>;
}


export function RegisterPage() {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [error, setError] = useState<any>(null);

    const handleRegister = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        if (password !== passwordConfirmation) {
            setError({ password_confirmation: ["Passwords do not match"] });
            return;
        }
        try {
            await axios.post('/api/auth/register', {
                name,
                email,
                password,
                password_confirmation: passwordConfirmation,
            });
            alert('Registration successful! Please log in.');
            navigate('/login');
        } catch (err: any) {
            console.error('Registration failed:', err);
            setError(err.response?.data || { message: 'Registration Failed!' });
        }
    };

    return (
        <div>
            <h2>Register Page</h2>
            <form onSubmit={handleRegister} style={styles.form}>
                <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    style={styles.input}
                />
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
                <input
                    type="password"
                    placeholder="Confirm Password"
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    required
                    style={styles.input}
                />
                <button type="submit" style={styles.button}>Register</button>
                <ErrorDisplay error={error} />
            </form>
        </div>
    );
}
