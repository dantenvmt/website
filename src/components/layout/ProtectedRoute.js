import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
    // Check for the token in local storage
    const token = localStorage.getItem('token');

    // If a token exists, render the child route (e.g., AdminPage).
    // Otherwise, redirect the user to the login page.
    return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;