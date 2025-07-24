import React, { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

// Create the context
const AuthContext = createContext(null);

// Create the AuthProvider component
export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(() => localStorage.getItem('token'));
    const [user, setUser] = useState(null);

    // This effect runs when the component mounts or the token changes
    useEffect(() => {
        try {
            const storedToken = localStorage.getItem('token');
            if (storedToken) {
                const decodedUser = jwtDecode(storedToken);
                setUser(decodedUser.user);
                setToken(storedToken);
            } else {
                // No token found, ensure state is cleared
                setUser(null);
                setToken(null);
            }
        } catch (error) {
            // If token is invalid, clear it
            console.error("Invalid token:", error);
            setUser(null);
            setToken(null);
            localStorage.removeItem('token');
        }
    }, [token]); // Re-run this effect if the token ever changes externally

    // Login function that updates localStorage and state
    const login = (newToken) => {
        localStorage.setItem('token', newToken);
        setToken(newToken); // This will trigger the useEffect above
    };

    // Logout function that clears localStorage and state
    const logout = () => {
        localStorage.removeItem('token');
        setToken(null); // This will trigger the useEffect above
    };

    // The value provided to all consuming components
    const value = { token, user, login, logout };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to easily use the auth context in other components
export const useAuth = () => {
    return useContext(AuthContext);
};