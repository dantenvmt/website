import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const API_URL = process.env.REACT_APP_API_URL || 'https://renaisons.com';

const AVATAR_COLORS = [
    'bg-cyan-500',
    'bg-fuchsia-500',
    'bg-emerald-500',
    'bg-orange-500',
    'bg-violet-500',
    'bg-sky-500',
    'bg-pink-500',
];

const FIRST_NAMES = [
    'Liam', 'Noah', 'Ethan', 'Mia', 'Olivia', 'Ava', 'Sophia', 'Emma',
    'Lucas', 'Mason', 'Logan', 'Chloe', 'Ella', 'Grace', 'Nora', 'Leo',
    'Zoe', 'Aiden', 'Aria', 'Ivy', 'Ezra', 'Ruby', 'Jack', 'Mila'
];

const LAST_NAMES = [
    'Nguyen', 'Smith', 'Johnson', 'Lee', 'Patel', 'Tran', 'Kim', 'Garcia',
    'Brown', 'Davis', 'Wilson', 'Lopez', 'Hall', 'Young', 'Allen', 'King',
    'Wright', 'Scott', 'Flores', 'Hill', 'Adams', 'Baker', 'Rivera', 'Cruz'
];

const getInitials = (name = '') => {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() || '')
        .join('');
};

const randomFromArray = (arr) => arr[Math.floor(Math.random() * arr.length)];

const createRandomName = () => `${randomFromArray(FIRST_NAMES)} ${randomFromArray(LAST_NAMES)}`;

const createApplicantNames = () => [createRandomName(), createRandomName(), createRandomName()];

const createAppliedCount = () => Math.floor(Math.random() * 100) + 1;

const LatestRoles = () => {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchLatestJobs = async () => {
            try {
                setIsLoading(true);
                setError('');

                const params = new URLSearchParams({
                    offset: '0',
                    limit: '8',
                });

                const res = await fetch(`${API_URL}/api/get_jobs.php?${params.toString()}`);
                if (!res.ok) throw new Error('Failed to fetch latest jobs');

                const data = await res.json();
                setJobs(Array.isArray(data?.data) ? data.data.slice(0, 8) : []);
            } catch (err) {
                setError('Could not load latest roles.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchLatestJobs();
    }, []);

    const roleCards = useMemo(() => {
        return jobs.map((job, index) => ({
            ...job,
            appliedCount: createAppliedCount(),
            applicants: createApplicantNames(),
            cardKey: `${job.id || index}-${job.title || 'job'}-${index}`,
        }));
    }, [jobs]);

    const handleOpenJobBoard = (job) => {
        navigate(`/job_board?q=${encodeURIComponent(job.title || '')}`);
    };

    return (
        <section className="px-6 pb-16">
            <div className="mx-auto max-w-7xl">
                <div className="mb-5">
                    <h2 className="text-[28px] font-semibold text-white">Latest roles</h2>
                </div>

                {isLoading ? (
                    <div className="flex h-28 items-center justify-center rounded-2xl border border-[#333742] bg-[#14171f]/80">
                        <div className="flex items-center gap-2 text-[#94a3b8]">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Loading latest roles...
                        </div>
                    </div>
                ) : error ? (
                    <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
                        {error}
                    </div>
                ) : roleCards.length === 0 ? (
                    <div className="rounded-2xl border border-[#333742] bg-[#14171f]/80 p-8 text-center text-[#94a3b8]">
                        No roles available right now.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {roleCards.map((job, index) => (
                            <motion.button
                                key={job.cardKey}
                                type="button"
                                onClick={() => handleOpenJobBoard(job)}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.2 }}
                                transition={{ duration: 0.25, delay: index * 0.03 }}
                                whileHover={{ y: -4 }}
                                whileTap={{ scale: 0.99 }}
                                className="group flex h-[140px] flex-col justify-between rounded-2xl border border-[#333742] bg-[#14171f]/90 px-4 py-4 text-left transition-all hover:border-[#00e5ff]/35 hover:shadow-[0_12px_30px_-20px_rgba(0,229,255,0.35)]"
                            >
                                <div>
                                    <h3 className="line-clamp-2 text-[15px] font-semibold leading-6 text-[#f1f4f8]">
                                        {job.title || 'Untitled Role'}
                                    </h3>

                                    <p className="mt-1 text-[14px] text-[#94a3b8]">
                                        {job.salary || 'Compensation not listed'}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center min-w-0">
                                        <div className="flex -space-x-2 shrink-0">
                                            {job.applicants.slice(0, 3).map((name, avatarIndex) => (
                                                <div
                                                    key={`${job.cardKey}-avatar-${avatarIndex}`}
                                                    className={`flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#14171f] text-[9px] font-bold text-white ${AVATAR_COLORS[avatarIndex % AVATAR_COLORS.length]}`}
                                                    title={name}
                                                >
                                                    {getInitials(name)}
                                                </div>
                                            ))}
                                        </div>

                                        <span className="ml-2 truncate text-[13px] text-[#94a3b8]">
                                            {job.appliedCount} applied recently
                                        </span>
                                    </div>

                                    <span className="ml-3 shrink-0 text-[14px] font-medium text-[#cbd5e1] transition-colors group-hover:text-[#00e5ff]">
                                        Apply
                                    </span>
                                </div>
                            </motion.button>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default LatestRoles;