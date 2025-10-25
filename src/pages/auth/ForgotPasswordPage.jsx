import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthFormContainer from '../../components/layout/AuthFormContainer';
import FormInput from '../../components/resume/FormInput'; // Re-using this component

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await fetch('https://renaisons.com/api/request_password_reset.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const result = await response.json();

            // IMPORTANT: Show a generic success message even if the email is not found.
            // This prevents attackers from guessing which emails are registered.
            if (response.ok || result.status === 'success') {
                setMessage({ type: 'success', text: result.message || 'If an account with that email exists, a reset link has been sent.' });
                setEmail('');
            } else {
                setMessage({ type: 'error', text: result.message || 'An error occurred.' });
            }
        } catch (error) {
            console.error("Forgot Password Error:", error);
            setMessage({ type: 'error', text: 'An error occurred. Please try again later.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthFormContainer title="Forgot Your Password?">
            <form onSubmit={handleSubmit} className="space-y-4">
                {message.type !== 'success' && (
                    <p className="text-sm text-center text-gray-300">
                        Enter your email address and we will send you a link to reset your password.
                    </p>
                )}

                {message.text && (
                    <p className={`text-sm text-center ${message.type === 'error' ? 'text-red-400' : 'text-green-400'}`}>
                        {message.text}
                    </p>
                )}

                {message.type !== 'success' && (
                    <>
                        <FormInput
                            label="Email"
                            type="email"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                        />

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md disabled:opacity-50 transition-colors mt-4"
                        >
                            {isLoading ? 'Sending...' : 'Send Reset Link'}
                        </button>
                    </>
                )}
            </form>

            <div className="text-center mt-4">
                <Link to="/login" className="text-sm text-blue-400 hover:underline">
                    Back to Login
                </Link>
            </div>
        </AuthFormContainer>
    );
};

export default ForgotPasswordPage;
