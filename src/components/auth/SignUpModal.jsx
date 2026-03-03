// src/components/auth/SignupModal.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext.js';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

const SignupModal = ({ isOpen, onClose, onSignupSuccess }) => {
    const { login } = useAuth();

    // Form States
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Email Verification States
    const [isCodeSent, setIsCodeSent] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [isEmailVerified, setIsEmailVerified] = useState(false);

    // UI States
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [emailError, setEmailError] = useState('');
    const [loading, setLoading] = useState(false);

    // Password Validation States
    const [strengthScore, setStrengthScore] = useState(0);
    const [strengthLabel, setStrengthLabel] = useState('');
    const [rules, setRules] = useState({ length: false, upper: false, lower: false, number: false, symbol: false });

    const validateEmail = (emailToTest) => {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(emailToTest)) {
            setEmailError("Please enter a valid email address.");
            return false;
        }
        setEmailError('');
        return true;
    };

    useEffect(() => {
        if (!password) {
            setStrengthScore(0); setStrengthLabel('');
            setRules({ length: false, upper: false, lower: false, number: false, symbol: false });
            return;
        }
        const newRules = {
            length: password.length >= 8,
            upper: /[A-Z]/.test(password),
            lower: /[a-z]/.test(password),
            number: /[0-9]/.test(password),
            symbol: /[^A-Za-z0-9]/.test(password)
        };
        setRules(newRules);

        let score = 0;
        if (password.length >= 8) score += 1;
        if (password.length >= 12) score += 1;
        const varietyCount = [newRules.upper, newRules.lower, newRules.number, newRules.symbol].filter(Boolean).length;
        if (varietyCount >= 2) score += 1;
        if (varietyCount >= 3) score += 1;
        if (score > 4) score = 4;

        let label = '';
        if (password.length < 8) label = 'Too Short';
        else if (score < 3) label = 'Weak';
        else if (score === 3) label = 'Good';
        else label = 'Strong';

        setStrengthScore(score); setStrengthLabel(label);
    }, [password]);

    const isPasswordValid = Object.values(rules).every(Boolean);

    const getStrengthColor = () => {
        if (password.length < 8) return 'bg-neutral-600';
        if (strengthScore <= 2) return 'bg-red-500';
        if (strengthScore === 3) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const resetForm = () => {
        setFirstName(''); setLastName(''); setEmail(''); setPassword(''); setConfirmPassword('');
        setVerificationCode(''); setIsCodeSent(false); setIsEmailVerified(false);
        setError(''); setSuccessMsg('');
    };

    const handleClose = () => {
        resetForm();
        if (onClose) onClose();
    }

    // --- 1. SEND VERIFICATION CODE ---
    const handleSendCode = async () => {
        if (!validateEmail(email)) return;
        setLoading(true); setError(''); setSuccessMsg('');

        try {
            const response = await fetch('https://renaisons.com/api/send_code.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({ email }),
                credentials: 'include',
            });
            const result = await response.json();
            if (response.ok && result.status === 'success') {
                setIsCodeSent(true);
                setSuccessMsg("Code sent! Check your email.");
            } else {
                setError(result.message || "Failed to send code.");
            }
        } catch (err) {
            setError('Connection failed. Please try again.');
        } finally { setLoading(false); }
    };

    // --- 2. VERIFY THE CODE ---
    const handleVerifyCode = async () => {
        setLoading(true); setError(''); setSuccessMsg('');

        try {
            const response = await fetch('https://renaisons.com/api/verify_code.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({ email, code: verificationCode }),
                credentials: 'include',
            });
            const result = await response.json();
            if (response.ok && result.status === 'success') {
                setIsEmailVerified(true);
                setSuccessMsg("Email verified successfully!");
            } else {
                setError(result.message || "Invalid code.");
            }
        } catch (err) {
            setError('Connection failed. Please try again.');
        } finally { setLoading(false); }
    };

    // --- 3. SUBMIT FINAL SIGNUP ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); setError(''); setSuccessMsg('');

        if (!isEmailVerified) { setError("Please verify your email first."); setLoading(false); return; }
        if (password !== confirmPassword) { setError("Passwords do not match."); setLoading(false); return; }
        if (!isPasswordValid) { setError("Please meet all password requirements."); setLoading(false); return; }

        try {
            const response = await fetch('https://renaisons.com/api/signup.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({ first_name: firstName, last_name: lastName, email, password }),
                credentials: 'include',
            });

            const result = await response.json();

            if (response.ok && result.status === 'success') {
                // Claim Resumes Logic
                try {
                    const guestId = localStorage.getItem('guest_id');
                    if (guestId) {
                        await fetch('https://renaisons.com/api/claim_resumes.php', {
                            method: 'POST', headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ guestId }), credentials: 'include'
                        });
                        localStorage.removeItem('guest_id');
                    }
                } catch (e) { console.error("Claim error ignored", e); }

                if (result.user) login(result.user);
                if (onSignupSuccess) onSignupSuccess(result.user || null);
                handleClose();
            } else {
                setError(result.message || "Signup failed.");
            }
        } catch (err) {
            setError('Connection failed. Please try again.');
        } finally { setLoading(false); }
    };

    const RuleItem = ({ satisfied, label }) => (
        <li className={`flex items-center space-x-2 text-xs transition-colors duration-200 ${satisfied ? 'text-green-400' : 'text-neutral-500'}`}>
            {satisfied ? <CheckCircleIcon className="h-4 w-4 text-green-500" /> : <div className="h-3 w-3 rounded-full border border-neutral-600 bg-transparent ml-0.5" />}
            <span>{label}</span>
        </li>
    );

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
                        <h2 className="text-xl font-semibold mb-6 text-center">Create Account</h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="flex space-x-2">
                                <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First Name" className="w-1/2 px-4 py-2 rounded-md bg-neutral-800 focus:outline-none text-white placeholder-neutral-500" required />
                                <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last Name" className="w-1/2 px-4 py-2 rounded-md bg-neutral-800 focus:outline-none text-white placeholder-neutral-500" required />
                            </div>

                            {/* Verification Section */}
                            <div className="space-y-2 bg-neutral-800/30 p-2 -mx-2 rounded-lg border border-neutral-800">
                                <div className="flex space-x-2">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => { setEmail(e.target.value); setIsCodeSent(false); setIsEmailVerified(false); if (emailError) setEmailError(''); }}
                                        disabled={isEmailVerified}
                                        placeholder="Email Address"
                                        className={`flex-1 px-4 py-2 rounded-md bg-neutral-800 focus:outline-none placeholder-neutral-500 transition-colors ${emailError ? 'border border-red-500 text-white' : 'text-white'} ${isEmailVerified ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        required
                                    />
                                    {!isEmailVerified && (
                                        <button
                                            type="button"
                                            onClick={handleSendCode}
                                            disabled={loading || !email || isCodeSent}
                                            className={`px-4 py-2 rounded-md font-semibold transition whitespace-nowrap text-sm
                                                ${(loading || !email || isCodeSent) ? 'bg-neutral-700 text-neutral-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 text-white'}`}
                                        >
                                            {isCodeSent ? 'Sent' : 'Send Code'}
                                        </button>
                                    )}
                                    {isEmailVerified && (
                                        <div className="flex items-center justify-center px-4 bg-green-500/10 border border-green-500/20 rounded-md">
                                            <CheckCircleIcon className="h-6 w-6 text-green-500" />
                                        </div>
                                    )}
                                </div>
                                {emailError && <p className="text-red-400 text-xs ml-1">{emailError}</p>}

                                {isCodeSent && !isEmailVerified && (
                                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="flex space-x-2 mt-2">
                                        <input
                                            type="text"
                                            value={verificationCode}
                                            onChange={(e) => setVerificationCode(e.target.value)}
                                            placeholder="Enter 6-digit code"
                                            className="w-full px-4 py-2 rounded-md bg-neutral-800 focus:outline-none text-white placeholder-neutral-500 text-center tracking-widest"
                                            maxLength={6}
                                        />
                                        <button
                                            type="button"
                                            onClick={handleVerifyCode}
                                            disabled={loading || verificationCode.length < 4}
                                            className={`px-6 py-2 rounded-md font-semibold transition text-sm
                                                ${(loading || verificationCode.length < 4) ? 'bg-neutral-700 text-neutral-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-500 text-white'}`}
                                        >
                                            Verify
                                        </button>
                                    </motion.div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full px-4 py-2 rounded-md bg-neutral-800 focus:outline-none text-white placeholder-neutral-500" required />
                                {password && (
                                    <div className="space-y-3 bg-neutral-800/30 p-3 rounded-md border border-neutral-800">
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

                            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm Password" className="w-full px-4 py-2 rounded-md bg-neutral-800 focus:outline-none text-white placeholder-neutral-500" required />

                            {error && <p className="text-red-500 text-sm text-center pt-1">{error}</p>}
                            {successMsg && <p className="text-green-500 text-sm text-center pt-1">{successMsg}</p>}

                            <button
                                type="submit"
                                disabled={loading || !isPasswordValid || !isEmailVerified}
                                className={`w-full py-2 mt-4 rounded-md transition flex items-center justify-center font-semibold
                                    ${(loading || !isPasswordValid || !isEmailVerified) ? 'bg-neutral-700 cursor-not-allowed text-neutral-400' : 'bg-indigo-600 hover:bg-indigo-500 text-white'}`}
                            >
                                {loading ? <motion.div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" initial={{ rotate: 0 }} animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} /> : 'Sign Up'}
                            </button>
                        </form>
                        <button onClick={handleClose} className="absolute top-2 right-3 text-gray-400 hover:text-white text-xl">✕</button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default SignupModal;