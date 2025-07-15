import React from 'react';

const Footer = () => (
    <footer className="w-full bg-black border-t border-neutral-900">
        <div className="container mx-auto px-6 py-6 text-center text-neutral-500">
            &copy; {new Date().getFullYear()} YourBrand. All rights reserved.
        </div>
    </footer>
);

export default Footer;
