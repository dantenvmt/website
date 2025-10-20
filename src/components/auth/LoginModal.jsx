// src/components/auth/LoginModal.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext'; // Make sure this path is correct

const LoginModal = ({ isOpen, onClose, onLoginSuccess }) => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => { // Make the function async
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Call the actual PHP login script
            const response = await fetch('https://renaisons.com/api/login.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ email, password }),
                credentials: 'include', // <-- IMPORTANT for session cookies
            });

            const result = await response.json();

            if (response.ok && result.status === 'success') {
                login(result.user);
                if (onLoginSuccess) {
                    onLoginSuccess(result.user);
                }
                setEmail('');
                setPassword('');
            } else {
                setError(result.message || `Login failed: ${response.statusText}`);
            }
        } catch (err) {
            console.error("Login fetch error:", err);
            setError('Login request failed. Check connection or server status.');
        } finally {
            setLoading(false);
        }
    };
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.25 }}
                        className="relative w-full max-w-sm rounded-2xl border border-neutral-800 bg-neutral-900 p-8 shadow-xl text-white" // Added text-white here
                    >
                        <h2 className="text-xl font-semibold mb-6 text-center">Log In</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email"
                                className="w-full px-4 py-2 rounded-md bg-neutral-800 focus:outline-none text-white placeholder-neutral-500" // Added text/placeholder color
                                required
                                autoComplete="email"
                            />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                className="w-full px-4 py-2 rounded-md bg-neutral-800 focus:outline-none text-white placeholder-neutral-500" // Added text/placeholder color
                                required
                                autoComplete="current-password"
                            />

                            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-2 mt-4 rounded-md transition flex items-center justify-center font-semibold
                  ${loading
                                        ? 'bg-neutral-700 cursor-not-allowed text-neutral-400' // Adjusted loading style
                                        : 'bg-blue-600 hover:bg-blue-500 text-white' // Adjusted normal style
                                    }`}
                            >
                                {loading ? (
                                    <motion.div
                                        className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"
                                        initial={{ rotate: 0 }}
                                        animate={{ rotate: 360 }}
                                        transition={{ repeat: Infinity, duration: 1 }}
                                    />
                                ) : (
                                    'Log in'
                                )}
                            </button>
                        </form>
                        <button
                            onClick={onClose}
                            className="absolute top-2 right-3 text-gray-400 hover:text-white text-xl" // Adjusted styling
                        >
                            ✕
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default LoginModal;