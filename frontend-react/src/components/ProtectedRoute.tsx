// src/components/ProtectedRoute.tsx
import React, {JSX, useContext} from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export function ProtectedRoute({ children }: { children: JSX.Element }) {
    const { token } = useContext(AuthContext);

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return children;
}