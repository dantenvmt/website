import React from 'react';
import { PrimaryButton, SecondaryButton } from '../components/common/Button';

const PlansPage = ({ setPage }) => (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-24 bg-black">
        <h1 className="text-4xl md:text-5xl font-bold mb-12 text-center text-white">Choose Your Plan</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-8 flex flex-col">
                <h3 className="text-2xl font-bold mb-2 text-white">Free</h3>
                <p className="text-neutral-400 mb-6">For individuals starting out.</p>
                <div className="text-4xl font-bold mb-6 text-white">$0<span className="text-lg font-normal text-neutral-400">/month</span></div>
                <ul className="space-y-3 text-neutral-300 mb-8 flex-grow">
                    <li>✓ Basic AI Access</li>
                    <li>✓ Standard Support</li>
                    <li>✓ 100 requests/day</li>
                </ul>
                <SecondaryButton onClick={() => setPage('register')} className="w-full">Get Started</SecondaryButton>
            </div>
            <div className="bg-neutral-900 border border-[#00A67E] rounded-xl p-8 flex flex-col relative">
                <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-[#00A67E] text-white text-xs font-bold px-3 py-1 rounded-full">MOST POPULAR</div>
                <h3 className="text-2xl font-bold mb-2 text-white">Pro</h3>
                <p className="text-neutral-400 mb-6">For professionals and teams.</p>
                <div className="text-4xl font-bold mb-6 text-white">$20<span className="text-lg font-normal text-neutral-400">/month</span></div>
                <ul className="space-y-3 text-neutral-300 mb-8 flex-grow">
                    <li>✓ Advanced AI Access</li>
                    <li>✓ Priority Support</li>
                    <li>✓ Unlimited requests</li>
                    <li>✓ Early access to new features</li>
                </ul>
                <PrimaryButton onClick={() => setPage('register')} className="w-full">Choose Pro</PrimaryButton>
            </div>
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-8 flex flex-col">
                <h3 className="text-2xl font-bold mb-2 text-white">Enterprise</h3>
                <p className="text-neutral-400 mb-6">For large-scale organizations.</p>
                <div className="text-4xl font-bold mb-6 text-white">Contact Us</div>
                <ul className="space-y-3 text-neutral-300 mb-8 flex-grow">
                    <li>✓ All Pro Features</li>
                    <li>✓ Dedicated Support & Onboarding</li>
                    <li>✓ Volume Discounts</li>
                    <li>✓ Advanced Security & SSO</li>
                </ul>
                <SecondaryButton className="w-full">Contact Sales</SecondaryButton>
            </div>
        </div>
    </div>
);

export default PlansPage;