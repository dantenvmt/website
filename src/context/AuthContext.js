import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Create the context
const AuthContext = createContext();

// Provider component that wraps your app
export const AuthProvider = ({ children }) => {

    // State to hold the user object (e.g., { email, role }) or null if not logged in
    const [user, setUser] = useState(null);
    // State to track if the initial authentication check is in progress
    const [loading, setLoading] = useState(true);

    // Function to check the backend session status when the app loads or refreshes
    const checkAuthStatus = useCallback(async () => {
        setLoading(true); // Start loading indicator
        try {
            // Fetch request to your PHP script that checks $_SESSION
            const response = await fetch('https://renaisons.com/api/check_auth.php', { // Adjust URL if needed
                method: 'GET', // Or POST, ensure it matches your check_auth.php
                credentials: 'include', // *** ESSENTIAL for sending session cookie ***
                headers: {
                    'Accept': 'application/json',
                },
            });

            if (!response.ok) {
                // If response status is not 2xx (e.g., 401 Unauthorized), assume not logged in
                setUser(null);
                // Optionally throw an error or log it
                return; // Stop processing further for this case
            }

            const result = await response.json();

            if (result.status === 'success' && result.user) {
                setUser(result.user); // Set user data if session is valid
            } else {
                setUser(null); // Clear user if session is invalid or data is missing
            }
        } catch (error) {
            console.error('Auth check fetch error:', error);
            setUser(null); // Assume not logged in on network errors, etc.
        } finally {
            setLoading(false); // Stop loading indicator regardless of outcome
        }
    }, []); // useCallback with empty dependency array ensures this function is stable

    // Run the authentication check once when the AuthProvider mounts
    useEffect(() => {
        checkAuthStatus();
    }, [checkAuthStatus]); // Run checkAuthStatus whenever it changes (only on mount due to useCallback)

    // Function called by LoginModal/LoginPage upon successful login from API
    const login = (userData) => {
        if (userData && userData.email && userData.role) {
            setUser(userData); // Update the global user state
        } else {
            console.error("Login function received invalid user data:", userData);
            setUser(null); // Ensure state is null if data is bad
        }
    };

    // Function to log the user out
    const logout = async () => {
        setUser(null); // Immediately update UI state to logged out
        try {
            // Call the PHP script to destroy the server-side session
            await fetch('https://renaisons.com/api/logout.php', { // Adjust URL if needed
                method: 'POST', // Or GET, ensure it matches your logout.php
                credentials: 'include', // *** ESSENTIAL for sending session cookie ***
            });
            // No need to check response unless you want to confirm server action
        } catch (error) {
            console.error('Logout fetch error:', error);
            // Even if server call fails, keep user logged out in frontend state
        }
        // Optionally add navigation after logout, e.g., using useNavigate() in the component calling logout
    };
    // Provide the user state, loading state, and auth functions to children
    return (
        <AuthContext.Provider value={{ user, login, logout, loading, checkAuthStatus }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to easily consume the AuthContext in components
export const useAuth = () => useContext(AuthContext);