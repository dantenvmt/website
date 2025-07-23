import React from 'react';
import AuthFormContainer from '../components/layout/AuthFormContainer';
import { PrimaryButton, SocialButton } from '../components/common/Button';

const RegisterPage = ({ setPage }) => (
    <AuthFormContainer
        title="Create an account"
        footerLink={{ text: "Already have an account?", linkText: "Log in", page: 'login' }}
        setPage={setPage}
    >
        <form className="space-y-4">
            <input type="email" placeholder="Email address" required className="w-full bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-500 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-[#00A67E]" />
            <PrimaryButton className="w-full">Continue</PrimaryButton>
        </form>
        <div className="my-6 flex items-center">
            <div className="flex-grow border-t border-neutral-700"></div>
            <span className="flex-shrink mx-4 text-neutral-500 text-sm">OR</span>
            <div className="flex-grow border-t border-neutral-700"></div>
        </div>
        <div className="space-y-3">
            <SocialButton>Continue with Google</SocialButton>
            <SocialButton>Continue with Microsoft</SocialButton>
            <SocialButton>Continue with Apple</SocialButton>
        </div>
    </AuthFormContainer>
);

export default RegisterPage;