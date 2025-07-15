import React from 'react';
import { PrimaryButton } from '../components/common/Button';

const HomePage = ({ setPage }) => (
    <div className="text-center flex flex-col items-center justify-center min-h-screen px-4 bg-black">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter mb-4 text-white">AI That Powers Your Business</h1>
        <p className="max-w-2xl text-neutral-400 text-lg md:text-xl mb-8">
            Securely enable your employees and automate workflows with our industry-leading AI products.
        </p>
        <PrimaryButton onClick={() => setPage('register')}>Get Started</PrimaryButton>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full">
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6 text-left">
                <h3 className="text-xl font-bold mb-2 text-white">Product Team</h3>
                <p className="text-neutral-400">Built for work with security and advanced models. Perfect for small to medium-sized teams.</p>
            </div>
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6 text-left">
                <h3 className="text-xl font-bold mb-2 text-white">Enterprise Solution</h3>
                <p className="text-neutral-400">With advanced security and admin controls for large-scale deployment.</p>
            </div>
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6 text-left">
                <h3 className="text-xl font-bold mb-2 text-white">Our API</h3>
                <p className="text-neutral-400">Integrate our models into your own products, tools, or operations seamlessly.</p>
            </div>
        </div>
    </div>
);
export default HomePage;