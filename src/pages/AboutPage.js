import React from 'react';

const AboutPage = () => (
    <div className="text-center flex flex-col items-center justify-center min-h-screen px-4 pt-24 bg-black">
        <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-">About Us</h1>
            <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop"
                alt="Team working in an office"
                className="rounded-xl mb-8 w-full h-auto object-cover"
                onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/600x400/000000/FFFFFF?text=Team+Image'; }}
            />
            <p className="text-neutral-300 text-lg mb-4">
                We are a dedicated team of engineers, researchers, and designers passionate about building the future of artificial intelligence. Our mission is to ensure that artificial general intelligence (AGI) benefits all of humanity.
            </p>
            <p className="text-neutral-400">
                Founded in 2025, we have been at the forefront of AI research, developing safe and powerful AI models that push the boundaries of what is possible.
            </p>
        </div>
    </div>
);

export default AboutPage;