import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LatestRoles from '../components/home/LatestRoles'; // Make sure this path matches your folder structure

const AnimatedCounter = ({ target, duration = 2000, suffix = "", decimals = 0 }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);

            // Cubic ease-out for smooth finish
            const easedProgress = 1 - Math.pow(1 - progress, 3);

            // Use toFixed to maintain decimal precision
            const currentCount = (easedProgress * target).toFixed(decimals);
            setCount(currentCount);

            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }, [target, duration, decimals]);

    return <span>{count}{suffix}</span>;
};

const HomePage = () => {
    return (
        <div className="min-h-screen bg-black text-white font-sans">
            {/* --- HERO SECTION --- */}
            <section className="py-20 px-6 max-w-5xl mx-auto text-center">
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-10 text-white">
                    Shape the future of work.
                </h1>

                <div className="flex flex-wrap justify-center gap-10 md:gap-20 mb-16 text-neutral-400">
                    <div className="text-center">
                        <span className="block text-white text-3xl md:text-4xl font-semibold mb-1">
                            $<AnimatedCounter target={100} suffix="+" />
                        </span>
                        <p className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-neutral-500 font-bold">
                            Average pay/hr
                        </p>
                    </div>

                    <div className="text-center">
                        <span className="block text-white text-3xl md:text-4xl font-semibold mb-1">
                            <AnimatedCounter target={50000} suffix="+" />
                        </span>
                        <p className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-neutral-500 font-bold">
                            Optimize Resume
                        </p>
                    </div>

                    <div className="text-center">
                        <span className="block text-white text-3xl md:text-4xl font-semibold mb-1">
                            $<AnimatedCounter target={1} decimals={1} suffix="M+" />
                        </span>
                        <p className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-neutral-500 font-bold">
                            Search Jobs
                        </p>
                    </div>
                </div>

                {/* Simplified Search Input */}
                <div className="max-w-xl mx-auto mb-10">
                    <input
                        type="text"
                        placeholder="What role are you looking for?"
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-full py-4 px-8 text-base text-white placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-[#06b6d4] transition-all"
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                    {/* Search Jobs Button */}
                    <button
                        className="w-full sm:w-auto bg-white text-black px-8 py-3 rounded-full font-bold text-sm transition-all duration-300 hover:bg-neutral-200 hover:-translate-y-1 hover:shadow-[0_10px_20px_-10px_rgba(6,182,212,0.6)]"
                    >
                        Search Jobs
                    </button>

                    {/* Optimize Resume Button */}
                    <Link
                        to="/resume"
                        className="w-full sm:w-auto bg-[#06b6d4] text-white px-8 py-3 rounded-full font-bold text-sm transition-all duration-300 hover:bg-[#0891b2] hover:-translate-y-1 hover:shadow-[0_10px_20px_-10px_rgba(6,182,212,0.6)]"
                    >
                        Optimize Resume
                    </Link>
                </div>
            </section>

            {/* --- LATEST ROLES SECTION --- */}
            {/* This will automatically render the grid with the 
                8 fake roles you set up in LatestRoles.jsx 
            */}
            <LatestRoles />

        </div>
    );
};

export default HomePage;