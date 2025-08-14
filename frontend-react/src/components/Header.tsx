// src/components/Header.tsx
import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { styles } from '../styles'; // Створимо цей файл зі стилями

export function Header() {
    const { token, user, setAuthToken } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        setAuthToken(null);
        navigate('/login');
    };

    return (
        <header style={{ marginBottom: '20px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
            <div style={styles.nav}>
                <h1>Intelli-Cart</h1>
                <nav>
                    {token ? (
                        <>
                            <span style={{ marginRight: '15px' }}>Вітаємо, {user?.name}!</span>
                            <button onClick={handleLogout} style={{...styles.button, backgroundColor: '#6c757d'}}>Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" style={{ marginRight: '10px' }}>Login</Link>
                            <Link to="/register">Register</Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}