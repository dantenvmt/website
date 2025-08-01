import React from 'react';

const SocialIcon = ({ href = "#", children }) => (
    <a href={href} className="text-neutral-400 hover:text-white transition-colors">
        {children}
    </a>
);

const Footer = () => {
    const currentYear = new Date().getFullYear();
    const companyName = "Renaisons";

    return (
        <footer className="bg-black py-8">
            <div className="max-w-7xl mx-auto px-8 md:px-12">
                {/* Bottom Bar */}
                <div className="mt-8 flex flex-col md:flex-row justify-between items-center text-sm text-neutral-500">
                    <div className="flex items-center gap-4 mb-4 md:mb-0">
                        <span>{companyName} © {currentYear}</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-4">
                            <SocialIcon><svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg></SocialIcon>
                            <SocialIcon><svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.165 6.738 9.489.5.09.682-.218.682-.483 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.031-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.03 1.595 1.03 2.688 0 3.848-2.338 4.695-4.566 4.942.359.308.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.577.688.482A10.001 10.001 0 0022 12c0-5.523-4.477-10-10-10z" /></svg></SocialIcon>
                            <SocialIcon><svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M21.25 2H2.75C2.336 2 2 2.336 2 2.75v18.5C2 21.664 2.336 22 2.75 22h18.5c.414 0 .75-.336.75-.75V2.75c0-.414-.336-.75-.75-.75zM8.29 18.995H5.45V9.72h2.84v9.275zM6.87 8.507c-.9 0-1.63-.73-1.63-1.63s.73-1.63 1.63-1.63 1.63.73 1.63 1.63-.73 1.63-1.63 1.63zm12.125 10.488h-2.84V14.3c0-.88-.015-2.01-1.225-2.01s-1.415.955-1.415 1.945v4.76h-2.84V9.72h2.725v1.24h.04c.375-.71 1.29-1.45 2.685-1.45 2.875 0 3.405 1.89 3.405 4.35v4.99z" /></svg></SocialIcon>
                            <SocialIcon><svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M11.999 2C6.476 2 2 6.476 2 12s4.476 10 9.999 10C17.522 22 22 17.524 22 12S17.522 2 11.999 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1.05-11.558c-1.01 0-1.83.82-1.83 1.83s.82 1.83 1.83 1.83 1.83-.82 1.83-1.83-.82-1.83-1.83-1.83zm0 5.54c-1.01 0-1.83.82-1.83 1.83s.82 1.83 1.83 1.83 1.83-.82 1.83-1.83-.82-1.83-1.83-1.83zm3.14-5.54c-1.01 0-1.83.82-1.83 1.83s.82 1.83 1.83 1.83 1.83-.82 1.83-1.83-.82-1.83-1.83-1.83zm0 5.54c-1.01 0-1.83.82-1.83 1.83s.82 1.83 1.83 1.83 1.83-.82 1.83-1.83-.82-1.83-1.83-1.83z" /></svg></SocialIcon>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;