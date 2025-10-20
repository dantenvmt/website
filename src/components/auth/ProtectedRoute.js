// src/components/auth/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children }) {
    const { token, loading } = useAuth();
    if (loading) return null;
    return token ? children : <Navigate to="/" replace />;
}
