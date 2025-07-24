import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminRoute = () => {
    const { user, token } = useAuth();

    // This handles the initial loading state where the context is still figuring out the user from the token.
    // It prevents a flicker or a momentary redirect before the user state is confirmed.
    if (!user && token) {
        return <div>Loading...</div>; // Or a proper spinner component
    }

    // If a user exists and their role is 'admin', allow them to see the nested routes.
    if (user && user.role === 'admin') {
        return <Outlet />;
    }

    // If a user exists but they are NOT an admin, redirect them to the homepage.
    if (user && user.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    // If there is no token at all, redirect to the login page.
    return <Navigate to="/login" replace />;
};

export default AdminRoute;