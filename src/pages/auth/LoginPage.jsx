// src/pages/auth/LoginPage.jsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom'; // Ensure Link is imported

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Call the actual PHP login script
            const response = await fetch('https://renaisons.com/api/login.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json', // Optional: Explicitly accept JSON
                },
                body: JSON.stringify({ email, password }),
                credentials: 'include',
            });

            const result = await response.json();

            if (response.ok && result.status === 'success') {
                login(result.user); // Update context with user data
                // Navigate based on role
                if (result.user?.role === 'admin') {
                    navigate('/admin');
                } else {
                    navigate('/resume'); // Or '/my-status' or '/' as default
                }
            } else {
                setError(result.message || `Login failed with status: ${response.status}`);
            }
        } catch (err) {
            // Handle network errors or issues parsing JSON
            console.error("Login fetch error:", err);
            setError('Login request failed. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center text-white bg-black"> {/* Added bg-black */}
            <div className="w-full max-w-sm rounded-2xl border border-neutral-800 bg-neutral-900 p-8 shadow-lg">
                <h1 className="mb-6 text-center text-2xl font-semibold">Sign In</h1>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm text-neutral-400 mb-1">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-lg bg-neutral-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white placeholder-neutral-500" // Added text/placeholder color
                            autoComplete="email"
                            placeholder="you@example.com" // Added placeholder
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-neutral-400 mb-1">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded-lg bg-neutral-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white placeholder-neutral-500" // Added text/placeholder color
                            autoComplete="current-password"
                            placeholder="Enter your password" // Added placeholder
                        />
                    </div>

                    {/* --- START: ADDED FORGOT PASSWORD LINK --- */}
                    <div className="text-right pt-1">
                        <Link
                            to="/forgot-password" // Link to the Forgot Password page route
                            className="text-sm text-blue-400 hover:underline"
                        >
                            Forgot Password?
                        </Link>
                    </div>
                    {/* --- END: ADDED FORGOT PASSWORD LINK --- */}


                    {error && (
                        <p className="text-red-500 text-sm text-center pt-2">{error}</p> // Added padding-top
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-indigo-600 py-2 font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 mt-4" // Added margin-top
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                {/* You might want a Sign Up link here too */}
                <p className="mt-6 text-center text-sm text-neutral-500"> {/* Increased margin-top */}
                    Don’t have an account? <Link to="/signup" className="text-indigo-400 hover:underline">Sign up</Link> {/* Make sure you have a /signup route */}
                </p>
            </div>
        </div>
    );
}
