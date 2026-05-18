// src/components/auth/LoginModal.jsx
import React, { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext.js';
import { Link } from 'react-router-dom';

/**
 * Inner form component owns the email/password state.
 *
 * Why this matters:
 *   Previously, email/password state lived on LoginModal itself. Every keystroke
 *   called setState on LoginModal, which is rendered by TopHeader, which sits
 *   inside MainLayout next to <Outlet />. React's reconciler had to walk the
 *   whole tree on every keystroke. Combined with the always-running CSS
 *   transform/box-shadow animations in HowItWorks on the homepage, this
 *   produced visible typing lag.
 *
 *   Isolating the state inside LoginForm means each keystroke only re-renders
 *   the form itself. The modal shell, the header, and everything else in the
 *   tree are untouched.
 */
const LoginForm = memo(function LoginForm({ onClose, onLoginSuccess }) {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('https://renaisons.com/api/login.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ email, password }),
                credentials: 'include',
            });

            const result = await response.json();

            if (response.ok && result.status === 'success') {
                // Claim guest resumes after login
                try {
                    const guestId = localStorage.getItem('guest_id');
                    if (guestId) {
                        await fetch('https://renaisons.com/api/claim_resumes.php', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ guestId }),
                            credentials: 'include'
                        });
                        localStorage.removeItem('guest_id');
                    }
                } catch (claimError) {
                    console.error("Failed to claim resumes during login:", claimError);
                }

                login(result.user);

                if (onLoginSuccess) {
                    onLoginSuccess(result.user);
                }

                setEmail('');
                setPassword('');

                if (onClose) {
                    onClose();
                }

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
        <form onSubmit={handleSubmit} className="space-y-4">
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full px-4 py-2 rounded-md bg-neutral-800 focus:outline-none text-white placeholder-neutral-500"
                required
                autoComplete="email"
            />
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-4 py-2 rounded-md bg-neutral-800 focus:outline-none text-white placeholder-neutral-500"
                required
                autoComplete="current-password"
            />

            <div className="text-right pt-1">
                <Link
                    to="/forgot-password"
                    onClick={onClose}
                    className="text-sm text-blue-400 hover:underline"
                >
                    Forgot Password?
                </Link>
            </div>

            {error && <p className="text-red-500 text-sm text-center pt-2">{error}</p>}

            <button
                type="submit"
                disabled={loading}
                className={`w-full py-2 mt-4 rounded-md transition flex items-center justify-center font-semibold
                    ${loading
                        ? 'bg-neutral-700 cursor-not-allowed text-neutral-400'
                        : 'bg-blue-600 hover:bg-blue-500 text-white'
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
    );
});

const LoginModal = ({ isOpen, onClose, onLoginSuccess }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.25 }}
                        className="relative w-full max-w-sm rounded-2xl border border-neutral-800 bg-neutral-900 p-8 shadow-xl text-white"
                    >
                        <h2 className="text-xl font-semibold mb-6 text-center">Log In</h2>
                        <LoginForm onClose={onClose} onLoginSuccess={onLoginSuccess} />
                        <button
                            onClick={onClose}
                            className="absolute top-2 right-3 text-gray-400 hover:text-white text-xl"
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