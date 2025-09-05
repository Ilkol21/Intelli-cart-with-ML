// src/components/Header.tsx
import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';

export function Header() {
    const { token, user, setAuthToken } = useContext(AuthContext);
    const { cartItems } = useContext(CartContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        setAuthToken(null);
        navigate('/login');
    };

    const totalItems = cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0);

    return (
        <header style={{ marginBottom: '20px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1><Link to="/catalog" style={{ textDecoration: 'none', color: 'inherit' }}>Intelli-Delivery</Link></h1>
                <nav style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    {token ? (
                        <>
                            <Link to="/catalog">Каталог</Link>
                            <Link to="/checkout">Кошик ({totalItems})</Link>
                            <span>Вітаємо, {user?.name}!</span>
                            <button onClick={handleLogout}>Вийти</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login">Login</Link>
                            <Link to="/register">Register</Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}
