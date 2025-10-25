import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import FormInput from '../../components/resume/FormInput';
import AuthFormContainer from '../../components/layout/AuthFormContainer';

const ResetPasswordPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [selector, setSelector] = useState('');
    const [validator, setValidator] = useState('');

    useEffect(() => {
        const sel = searchParams.get('selector');
        const val = searchParams.get('validator');

        if (sel && val) {
            setSelector(sel);
            setValidator(val);
        } else {
            setMessage({ type: 'error', text: 'Invalid or missing password reset link.' });
        }
    }, [searchParams]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (!selector || !validator) {
            setMessage({ type: 'error', text: 'Invalid or missing reset link parameters.' });
            return;
        }

        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match.' });
            return;
        }

        if (newPassword.length < 8) {
            setMessage({ type: 'error', text: 'Password must be at least 8 characters long.' });
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('https://renaisons.com/api/perform_password_reset.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    selector: selector,
                    validator: validator,
                    newPassword: newPassword,
                }),
            });

            const result = await response.json();

            if (response.ok && result.status === 'success') {
                setMessage({ type: 'success', text: 'Password has been reset successfully! Redirecting to login...' });
                setNewPassword('');
                setConfirmPassword('');
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } else {
                setMessage({ type: 'error', text: result.message || 'Failed to reset password. The link may be invalid or expired.' });
            }
        } catch (error) {
            console.error("Password Reset Error:", error);
            setMessage({ type: 'error', text: 'An error occurred. Please try again later.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthFormContainer title="Reset Your Password">
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Only show password fields if tokens were found AND reset is not successful */}
                {selector && validator && message.type !== 'success' && (
                    <>
                        <FormInput
                            label="New Password"
                            type="password"
                            name="newPassword"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            autoComplete="new-password"
                        />
                        <FormInput
                            label="Confirm New Password"
                            type="password"
                            name="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            autoComplete="new-password"
                        />
                    </>
                )}

                {message.text && (
                    <p className={`text-sm text-center ${message.type === 'error' ? 'text-red-400' : 'text-green-400'}`}>
                        {message.text}
                    </p>
                )}

                <button
                    type="submit"
                    // Disable button if tokens are missing, loading, or already succeeded
                    disabled={isLoading || !selector || !validator || message.type === 'success'}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md disabled:opacity-50 transition-colors mt-4"
                >
                    {isLoading ? 'Resetting...' : 'Set New Password'}
                </button>

                {message.type === 'success' && (
                    <div className="text-center mt-4">
                        <Link to="/login" className="text-sm text-blue-400 hover:underline">
                            Back to Login
                        </Link>
                    </div>
                )}
            </form>
        </AuthFormContainer>
    );
};

export default ResetPasswordPage;
