import React from 'react';

export const PrimaryButton = ({ children, className = '', ...props }) => (
    <button {...props} className={`bg-[#00A67E] hover:bg-[#008c69] text-white font-bold py-3 px-6 rounded-md transition-all ${className}`}>
        {children}
    </button>
);

export const SecondaryButton = ({ children, className = '', ...props }) => (
    <button {...props} className={`bg-transparent border border-neutral-600 hover:bg-neutral-800 text-white font-bold py-3 px-6 rounded-md transition-all ${className}`}>
        {children}
    </button>
);

export const SocialButton = ({ children, className = '', ...props }) => (
    <button {...props} className={`w-full bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 text-white font-semibold py-3 px-4 rounded-md transition-colors flex items-center justify-center gap-3 ${className}`}>
        {children}
    </button>
);