import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LatestRoles from '../components/home/LatestRoles';
import HowItWorks from '../components/home/HowItWorks';
import FAQ from '../components/home/FAQ';

const AnimatedCounter = ({ target, duration = 2000, suffix = '', decimals = 0 }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const easedProgress = 1 - Math.pow(1 - progress, 3);
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
    const navigate = useNavigate();
    const [jobQuery, setJobQuery] = useState('');

    const handleJobSearch = () => {
        const trimmed = jobQuery.trim();
        if (!trimmed) {
            navigate('/job_board');
            return;
        }
        navigate(`/job_board?q=${encodeURIComponent(trimmed)}`);
    };

    const handleJobSearchKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleJobSearch();
        }
    };

    return (
        <div className="min-h-screen text-white font-sans">
            {/* subtle teal glow at the top */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                    background:
                        'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(6,182,212,0.08), transparent 70%)',
                }}
            />

            {/* --- HERO SECTION --- */}
            <section className="py-24 sm:py-28 px-6 max-w-4xl mx-auto text-center">
                {/* Headline */}
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.1] text-white">
                    Shape the future of work.
                </h1>


                {/* Animated stats */}
                <div className="flex flex-wrap justify-center gap-10 md:gap-20 mt-12 text-neutral-400">
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
                            <AnimatedCounter target={1} decimals={1} suffix="M+" />
                        </span>
                        <p className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-neutral-500 font-bold">
                            Search Jobs
                        </p>
                    </div>
                </div>

                {/* Search input */}
                <div className="max-w-xl mx-auto mt-10">
                    <input
                        type="text"
                        value={jobQuery}
                        onChange={(e) => setJobQuery(e.target.value)}
                        onKeyDown={handleJobSearchKeyDown}
                        placeholder="Search roles like Data Analyst"
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-full py-4 px-8 text-base text-white placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-[#06b6d4] transition-all"
                    />
                </div>

                {/* CTAs — primary filled, secondary outlined */}
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8">
                    {/* Primary: Search Jobs (the hero's main action) */}
                    <button
                        type="button"
                        onClick={handleJobSearch}
                        className="w-full sm:w-auto bg-[#06b6d4] text-white px-8 py-3 rounded-full font-bold text-sm transition-all duration-300 hover:bg-[#0891b2] hover:-translate-y-1 hover:shadow-[0_10px_20px_-10px_rgba(6,182,212,0.6)]"
                    >
                        Search Jobs
                    </button>

                    {/* Secondary: Optimize Resume */}
                    <Link
                        to="/resume"
                        className="w-full sm:w-auto bg-transparent border border-neutral-700 text-white px-8 py-3 rounded-full font-bold text-sm transition-all duration-300 hover:border-neutral-500 hover:bg-white/[0.04] hover:-translate-y-1"
                    >
                        Optimize Resume
                    </Link>
                </div>
            </section>

            {/* --- LATEST ROLES SECTION --- */}
            <LatestRoles />

            {/* --- How it works --- */}
            <HowItWorks />

            {/* --- FAQ --- */}
            <FAQ />
        </div>
    );
};

export default HomePage;