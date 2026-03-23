import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// Predefined list of popular roles for students and their job counts
const POPULAR_ROLES = [
    { title: 'Data Analyst', count: 124 },
    { title: 'Business Analyst', count: 156 },
    { title: 'Software Engineer', count: 89 },
    { title: 'Data Scientist', count: 72 },
    { title: 'Marketing Intern', count: 45 },
    { title: 'Financial Analyst', count: 38 },
    { title: 'Product Manager', count: 31 },
    { title: 'UX/UI Designer', count: 24 }
];

const LatestRoles = () => {
    const navigate = useNavigate();

    const handleOpenJobBoard = (job) => {
        // Routes to your job board and applies the filter
        navigate(`/job_board?q=${encodeURIComponent(job.title)}`);
    };

    return (
        <section className="px-6 pb-16">
            <div className="mx-auto max-w-7xl">
                <div className="mb-6">
                    <h2 className="text-[28px] font-semibold text-white">Popular roles</h2>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {POPULAR_ROLES.map((job, index) => (
                        <motion.button
                            key={`popular-role-${index}`}
                            type="button"
                            onClick={() => handleOpenJobBoard(job)}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.2 }}
                            transition={{ duration: 0.25, delay: index * 0.03 }}
                            whileHover={{ y: -4 }}
                            whileTap={{ scale: 0.99 }}
                            // Changed to a horizontal flex layout (flex-row, items-center, justify-between)
                            className="group flex h-[76px] w-full items-center justify-between rounded-2xl border border-[#333742] bg-[#14171f]/90 px-5 text-left transition-all hover:bg-[#1a1f2e] hover:border-[#00e5ff]/50 hover:shadow-[0_8px_25px_-15px_rgba(0,229,255,0.3)]"
                        >
                            <h3 className="truncate pr-4 text-[15px] font-semibold text-[#f1f4f8] transition-colors group-hover:text-[#00e5ff]">
                                {job.title}
                            </h3>

                            {/* The "circled" pill badge for the job count */}
                            <span className="shrink-0 rounded-full border border-[#333742] bg-[#1e2330] px-3 py-1.5 text-[12px] font-medium text-[#94a3b8] transition-colors group-hover:border-[#00e5ff]/30 group-hover:bg-[#00e5ff]/10 group-hover:text-[#00e5ff]">
                                {job.count} jobs
                            </span>
                        </motion.button>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default LatestRoles;