// src/context/AuthContext.tsx
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

export const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [user, setUser] = useState<any>(JSON.parse(localStorage.getItem('user') || 'null'));

    const setAuthToken = (newToken: string | null, userData: any = null) => {
        if (newToken) {
            localStorage.setItem('token', newToken);
            localStorage.setItem('user', JSON.stringify(userData));
            axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            delete axios.defaults.headers.common['Authorization'];
        }
        setToken(newToken);
        setUser(userData);
    };

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
    }, [token]);

    return (
        <AuthContext.Provider value={{ token, user, setAuthToken }}>
            {children}
        </AuthContext.Provider>
    );
};
