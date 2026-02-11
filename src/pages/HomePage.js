import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

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
    const [roles, setRoles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Fetch specific job/role data instead of general news
        const fetchRoles = async () => {
            try {
                const response = await fetch('https://renaisons.com/api/get_roles.php');
                const result = await response.json();
                if (result.status === 'success') setRoles(result.data);
            } catch (error) {
                console.error("Failed to load roles:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchRoles();
    }, []);

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
                    {/* Search Jobs Button: Original White Color + New Hover Effects */}
                    <button
                        className="w-full sm:w-auto bg-white text-black px-8 py-3 rounded-full font-bold text-sm transition-all duration-300 hover:bg-neutral-200 hover:-translate-y-1 hover:shadow-[0_10px_20px_-10px_rgba(6,182,212,0.6)]"
                    >
                        Search Jobs
                    </button>

                    {/* Optimize Resume Button: Cyan Brand Color + Hover Effects */}
                    <Link
                        to="/resume"
                        className="w-full sm:w-auto bg-[#06b6d4] text-white px-8 py-3 rounded-full font-bold text-sm transition-all duration-300 hover:bg-[#0891b2] hover:-translate-y-1 hover:shadow-[0_10px_20px_-10px_rgba(6,182,212,0.6)]"
                    >
                        Optimize Resume
                    </Link>
                </div>
            </section>
            {/* --- LATEST ROLES SECTION --- */}
            <section className="max-w-5xl mx-auto px-6 pb-24">
                <h2 className="text-2xl font-bold mb-8">Latest roles</h2>
                <div className="grid gap-4">
                    {isLoading ? (
                        <div className="animate-pulse bg-neutral-900 h-20 rounded-xl" />
                    ) : roles.map(role => (
                        <Link key={role.id} to={`/jobs/${role.id}`} className="group flex items-center justify-between p-6 bg-neutral-900 border border-neutral-800 rounded-xl hover:border-neutral-600 transition-all">
                            <div>
                                <h3 className="text-xl font-bold group-hover:text-indigo-400">{role.title}</h3>
                                <p className="text-neutral-500 mt-1">{role.hired_count} hired recently</p>
                            </div>
                            <div className="text-right">
                                <span className="text-lg font-mono text-indigo-400">${role.pay_range}/hr</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default HomePage;