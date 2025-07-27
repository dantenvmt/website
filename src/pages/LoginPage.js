import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthFormContainer from '../components/layout/AuthFormContainer';
import { useAuth } from '../context/AuthContext';
import { jwtDecode } from 'jwt-decode';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await fetch('https://renaisons-api.onrender.com/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.msg || 'Failed to log in');
            }

            login(data.token);

            const decodedToken = jwtDecode(data.token);
            if (decodedToken.user.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/');
            }
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <AuthFormContainer title="Welcome back">
            <form onSubmit={handleSubmit} className="space-y-6">
                <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-neutral-700 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full bg-neutral-700 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-md transition">
                    Continue
                </button>
                <p className="text-center text-sm text-neutral-400">
                    Don't have an account? <Link to="/register" className="font-semibold text-blue-500 hover:underline">Sign up</Link>
                </p>
            </form>
        </AuthFormContainer>
    );
};

export default LoginPage;
