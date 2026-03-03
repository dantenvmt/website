// src/pages/user/ChangePasswordPage.js
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import FormInput from '../../components/resume/FormInput';

const ChangePasswordPage = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });
    const [isLoading, setIsLoading] = useState(false);

    // --- Password Validation States ---
    const [strengthScore, setStrengthScore] = useState(0);
    const [strengthLabel, setStrengthLabel] = useState('');
    const [rules, setRules] = useState({ length: false, upper: false, lower: false, number: false, symbol: false });

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

        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match.' });
            return;
        }

        if (!isPasswordValid) {
            setMessage({ type: 'error', text: 'Please meet all new password requirements.' });
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('https://renaisons.com/api/change_password.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword }),
                credentials: 'include',
            });

            const result = await response.json();

            if (response.ok && result.status === 'success') {
                setMessage({ type: 'success', text: 'Password changed successfully!' });
                setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
                setStrengthScore(0); setStrengthLabel(''); // Reset meter
            } else {
                setMessage({ type: 'error', text: result.message || 'Failed to change password.' });
            }
        } catch (error) {
            console.error("Change Password Error:", error);
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
        <div className="p-8 md:p-12 text-white">
            <h1 className="text-4xl font-bold mb-6 text-center">Change Password</h1>
            <section className="p-6 rounded-lg border border-neutral-700 max-w-lg mx-auto">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <FormInput
                        label="Current Password"
                        type="password"
                        name="currentPassword"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                    />

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

                    {message.text && (
                        <p className={`text-sm text-center ${message.type === 'error' ? 'text-red-400' : 'text-green-400'}`}>
                            {message.text}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading || !isPasswordValid || currentPassword === ''}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md disabled:opacity-50 transition-colors"
                    >
                        {isLoading ? 'Changing...' : 'Change Password'}
                    </button>
                </form>
            </section>
        </div>
    );
};

export default ChangePasswordPage;