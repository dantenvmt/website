import React from 'react';
import AuthFormContainer from '../components/layout/AuthFormContainer';
import { PrimaryButton } from '../components/common/Button';

const LoginPage = ({ setPage }) => (
    <AuthFormContainer
        title="Welcome back"
        footerLink={{ text: "Don't have an account?", linkText: "Sign up", page: 'register' }}
        setPage={setPage}
    >
        <form className="space-y-4">
            <input type="email" placeholder="Email address" required className="w-full bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-500 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-[#00A67E]" />
            <input type="password" placeholder="Password" required className="w-full bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-500 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-[#00A67E]" />
            <PrimaryButton className="w-full">Log In</PrimaryButton>
        </form>
    </AuthFormContainer>
);

export default LoginPage;