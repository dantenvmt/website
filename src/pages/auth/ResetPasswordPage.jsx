// src/pages/auth/ResetPasswordPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
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

    // --- Password Validation States ---
    const [strengthScore, setStrengthScore] = useState(0);
    const [strengthLabel, setStrengthLabel] = useState('');
    const [rules, setRules] = useState({ length: false, upper: false, lower: false, number: false, symbol: false });

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

    // --- Real-Time Password Validation Checker ---
    useEffect(() => {
        if (!newPassword) {
            setStrengthScore(0); setStrengthLabel('');
            setRules({ length: false, upper: false, lower: false, number: false, symbol: false });
            return;
        }
        const newRules = {
            length: newPassword.length >= 8,
            upper: /[A-Z]/.test(newPassword),
            lower: /[a-z]/.test(newPassword),
            number: /[0-9]/.test(newPassword),
            symbol: /[^A-Za-z0-9]/.test(newPassword)
        };
        setRules(newRules);

        let score = 0;
        if (newPassword.length >= 8) score += 1;
        if (newPassword.length >= 12) score += 1;
        const varietyCount = [newRules.upper, newRules.lower, newRules.number, newRules.symbol].filter(Boolean).length;
        if (varietyCount >= 2) score += 1;
        if (varietyCount >= 3) score += 1;
        if (score > 4) score = 4;

        let label = '';
        if (newPassword.length < 8) label = 'Too Short';
        else if (score < 3) label = 'Weak';
        else if (score === 3) label = 'Good';
        else label = 'Strong';

        setStrengthScore(score); setStrengthLabel(label);
    }, [newPassword]);

    const isPasswordValid = Object.values(rules).every(Boolean);

    const getStrengthColor = () => {
        if (newPassword.length < 8) return 'bg-neutral-600';
        if (strengthScore <= 2) return 'bg-red-500';
        if (strengthScore === 3) return 'bg-yellow-500';
        return 'bg-green-500';
    };

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

        if (!isPasswordValid) {
            setMessage({ type: 'error', text: 'Please meet all password requirements.' });
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('https://renaisons.com/api/perform_password_reset.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({ selector, validator, newPassword }),
            });

            const result = await response.json();

            if (response.ok && result.status === 'success') {
                setMessage({ type: 'success', text: 'Password has been reset successfully! Redirecting to login...' });
                setNewPassword(''); setConfirmPassword('');
                setTimeout(() => navigate('/login'), 3000);
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

    const RuleItem = ({ satisfied, label }) => (
        <li className={`flex items-center space-x-2 text-xs transition-colors duration-200 ${satisfied ? 'text-green-400' : 'text-neutral-500'}`}>
            {satisfied ? <CheckCircleIcon className="h-4 w-4 text-green-500" /> : <div className="h-3 w-3 rounded-full border border-neutral-600 bg-transparent ml-0.5" />}
            <span>{label}</span>
        </li>
    );

    return (
        <AuthFormContainer title="Reset Your Password">
            <form onSubmit={handleSubmit} className="space-y-4">
                {selector && validator && message.type !== 'success' && (
                    <>
                        <div className="space-y-2">
                            <FormInput
                                label="New Password"
                                type="password"
                                name="newPassword"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                autoComplete="new-password"
                            />

                            {/* Strength Meter and Rules Display */}
                            {newPassword && (
                                <div className="space-y-3 bg-neutral-800/30 p-3 rounded-md border border-neutral-800 text-left">
                                    <div>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-neutral-400">Strength</span>
                                            <span className={`font-semibold ${strengthLabel === 'Strong' ? 'text-green-400' : strengthLabel === 'Good' ? 'text-yellow-400' : 'text-red-400'}`}>{strengthLabel}</span>
                                        </div>
                                        <div className="w-full h-1 bg-neutral-700 rounded-full overflow-hidden">
                                            <motion.div className={`h-full ${getStrengthColor()}`} initial={{ width: 0 }} animate={{ width: `${(strengthScore / 4) * 100}%` }} transition={{ duration: 0.3 }} />
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-neutral-400 mb-1 uppercase tracking-wider">Requirements</p>
                                        <ul className="grid grid-cols-1 gap-1">
                                            <RuleItem satisfied={rules.length} label="At least 8 characters" />
                                            <RuleItem satisfied={rules.upper} label="Uppercase letter (A-Z)" />
                                            <RuleItem satisfied={rules.lower} label="Lowercase letter (a-z)" />
                                            <RuleItem satisfied={rules.number} label="Number (0-9)" />
                                            <RuleItem satisfied={rules.symbol} label="Symbol (!@#$...)" />
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>

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
                    // Added requirement validation check to the disabled prop
                    disabled={isLoading || !selector || !validator || message.type === 'success' || !isPasswordValid}
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