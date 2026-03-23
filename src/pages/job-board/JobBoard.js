import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { QueryClient, QueryClientProvider, useInfiniteQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
    Search, MapPin, Briefcase, Bookmark, BookmarkCheck, Clock, DollarSign,
    X, ChevronUp, Heart, WandSparkles, Loader2, Trash2, ExternalLink,
    Upload, FileText, Sparkles, BarChart3, Compass, ShieldCheck, ChevronDown
} from 'lucide-react';
import DOMPurify from 'dompurify';
function cn(...inputs) {
    return twMerge(clsx(inputs));
}

// --------------------------------------------------------------------------
// Constants & API
// --------------------------------------------------------------------------

const JOB_SOURCES = [
    { value: 'USAJobs', label: 'USAJobs' },
    { value: 'Adzuna', label: 'Adzuna' },
    { value: 'JSearch', label: 'JSearch' },
    { value: 'Greenhouse', label: 'Greenhouse' },
    { value: 'Lever', label: 'Lever' },
    { value: 'RemoteOK', label: 'RemoteOK' },
    { value: 'TheMuse', label: 'The Muse' },
    { value: 'Remotive', label: 'Remotive' },
    { value: 'Findwork', label: 'Findwork' },
    { value: 'CareerOneStop', label: 'CareerOneStop' },
    { value: 'HN RSS', label: 'HN RSS' },
];

const API_URL = process.env.REACT_APP_API_URL || 'https://renaisons.com';
const PAGE_SIZE = 48;
const api = {
    jobs: {
        list: async ({ pageParam = 0, q, location, source, remote }) => {
            const params = new URLSearchParams({ offset: pageParam, limit: PAGE_SIZE });
            if (q) params.append('q', q);
            if (location) params.append('location', location);
            if (source) params.append('source', source);
            if (remote) params.append('remote', 'true');

            const res = await fetch(`${API_URL}/api/get_jobs.php?${params}`);
            if (!res.ok) throw new Error('Failed to fetch jobs');
            return res.json();
        }
    },
    ai: {
        summary: async (id) => {
            const res = await fetch(`${API_URL}/api/v1/jobs/${id}/summary`);
            if (!res.ok) throw new Error('Failed to fetch summary');
            return res.json();
        },
        extractResume: async (file) => {
            const formData = new FormData();
            formData.append('file', file);
            const res = await fetch(`${API_URL}/api/v1/resume/extract`, { method: 'POST', body: formData });
            if (!res.ok) throw new Error('Extraction failed');
            return res.json();
        },
        analyzeResume: async (text, level) => {
            const res = await fetch(`${API_URL}/api/v1/resume/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, critique_level: level })
            });
            if (!res.ok) throw new Error('Analysis failed');
            return res.json();
        },
        optimizeResumeForJob: async (jobId, resumeText, level) => {
            const res = await fetch(`${API_URL}/api/v1/resume/optimize/${jobId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resume_text: resumeText, critique_level: level })
            });
            if (!res.ok) throw new Error('Optimization failed');
            return res.json();
        }
    }
};
function formatSalary(job) {
    if (job.salary) return job.salary;

    const min = job.salary_min ? Number(job.salary_min) : null;
    const max = job.salary_max ? Number(job.salary_max) : null;

    const formatNumber = (value) =>
        new Intl.NumberFormat('en-US', {
            maximumFractionDigits: 0,
        }).format(value);

    if (min && max) return `$${formatNumber(min)} - $${formatNumber(max)}`;
    if (min) return `$${formatNumber(min)}+`;
    if (max) return `Up to $${formatNumber(max)}`;

    return null;
}

function getWorkTypeBadges(job) {
    const badges = [];

    if (job.remote) badges.push('Remote');

    const text = `${job.employment_type || ''} ${job.job_type || ''} ${job.type || ''}`.toLowerCase();

    if (text.includes('full')) badges.push('Full-time');
    if (text.includes('part')) badges.push('Part-time');
    if (text.includes('contract')) badges.push('Contract');
    if (text.includes('intern')) badges.push('Internship');

    return [...new Set(badges)];
}

function formatExperience(job) {
    if (job.years_experience) {
        return `${job.years_experience} yrs`;
    }

    if (job.experience_years) {
        return `${job.experience_years} yrs`;
    }

    if (job.seniority) {
        const value = String(job.seniority).toLowerCase();

        if (value.includes('intern')) return '0-1 yrs';
        if (value.includes('junior') || value.includes('entry')) return '0-2 yrs';
        if (value.includes('associate')) return '1-3 yrs';
        if (value.includes('mid')) return '2-5 yrs';
        if (value.includes('senior')) return '5+ yrs';
        if (value.includes('staff')) return '7+ yrs';
        if (value.includes('principal')) return '8+ yrs';
        if (value.includes('lead')) return '6+ yrs';
        if (value.includes('manager')) return '5+ yrs';
    }

    return null;
}
// --------------------------------------------------------------------------
// Hooks
// --------------------------------------------------------------------------
function useJobsList(filters) {
    return useInfiniteQuery({
        queryKey: ['jobs', filters],
        queryFn: ({ pageParam = 0 }) => api.jobs.list({ ...filters, pageParam }),
        getNextPageParam: (lastPage, allPages) => {
            if (!lastPage || !lastPage.data || lastPage.data.length < PAGE_SIZE) return undefined;
            return allPages.length * PAGE_SIZE;
        }
    });
}
function getTimeAgo(dateValue) {
    if (!dateValue) return 'Recent';

    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return 'Recent';

    const now = new Date();
    const diffMs = now - date;

    if (diffMs < 0) return 'Recent';

    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;
    const week = 7 * day;
    const month = 30 * day;

    if (diffMs < minute) {
        return 'Just now';
    }

    if (diffMs < hour) {
        const mins = Math.floor(diffMs / minute);
        return mins === 1 ? '1 minute ago' : `${mins} minutes ago`;
    }

    if (diffMs < day) {
        const hours = Math.floor(diffMs / hour);
        return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
    }

    if (diffMs < week) {
        const days = Math.floor(diffMs / day);
        return days === 1 ? '1 day ago' : `${days} days ago`;
    }

    if (diffMs < month) {
        const weeks = Math.floor(diffMs / week);
        return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
    }

    const months = Math.floor(diffMs / month);
    return months === 1 ? '1 month ago' : `${months} months ago`;
}

function useSavedJobs() {
    const [savedJobs, setSavedJobs] = useState([]);

    useEffect(() => {
        try {
            const stored = localStorage.getItem('job_saved_v1');
            if (stored) setSavedJobs(JSON.parse(stored));
        } catch (e) { }
    }, []);

    const save = useCallback((jobs) => {
        setSavedJobs(jobs);
        localStorage.setItem('job_saved_v1', JSON.stringify(jobs));
    }, []);

    const toggleSaved = (job) => {
        const exists = savedJobs.find((j) => j.id === job.id);
        if (exists) save(savedJobs.filter((j) => j.id !== job.id));
        else save([...savedJobs, job]);
    };

    const isJobSaved = (job) => !!savedJobs.find((j) => j.id === job.id);
    const unsaveJob = (id) => save(savedJobs.filter((j) => j.id !== id));
    const clearAll = () => save([]);

    return { savedJobs, isJobSaved, toggleSaved, unsaveJob, clearAll };
}

function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

// --------------------------------------------------------------------------
// Hardcoded UI Components
// --------------------------------------------------------------------------

const Badge = ({ children, variant = 'default', className }) => {
    const variants = {
        default: 'bg-[#00e5ff]/10 text-[#00e5ff] border-[#00e5ff]/20',
        secondary: 'bg-[#1e2129] text-[#f1f4f8] border-transparent',
        outline: 'border-[#333742] text-[#f1f4f8] bg-[#14171f]/50'
    };
    return (
        <div className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold", variants[variant], className)}>
            {children}
        </div>
    );
};

const Button = ({ children, variant = 'default', size = 'default', className, disabled, ...props }) => {
    const variants = {
        default: 'bg-[#00e5ff] text-[#0b0e14] hover:bg-[#00e5ff]/90',
        outline: 'border border-[#333742] bg-[#14171f]/50 hover:bg-[#1e2129] hover:text-[#f1f4f8] text-[#f1f4f8]',
        ghost: 'hover:bg-[#1e2129] text-[#f1f4f8]',
    };
    const sizes = {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3 text-xs',
        lg: 'h-11 px-8',
        icon: 'h-10 w-10',
    };
    return (
        <button disabled={disabled} className={cn("inline-flex items-center justify-center rounded-xl text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none cursor-pointer", variants[variant], sizes[size], className)} {...props}>
            {children}
        </button>
    );
};

const Input = ({ className, ...props }) => (
    <input className={cn("flex h-10 w-full rounded-xl border border-[#333742] bg-[#14171f]/50 px-3 py-2 text-sm text-[#f1f4f8] placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#00e5ff]/50", className)} {...props} />
);

// --------------------------------------------------------------------------
// Feature Components
// --------------------------------------------------------------------------

const SavedJobsDrawer = ({ isOpen, onClose, savedJobs, onSelectJob, onRemove, onClearAll }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Sliding Panel */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-[#333742] bg-[#0b0e14]/95 backdrop-blur-xl text-[#f1f4f8] shadow-2xl"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-[#333742] p-6">
                            <div>
                                <h2 className="text-xl font-bold text-[#f1f4f8]">Saved Roles</h2>
                                <p className="text-xs text-[#94a3b8] mt-1">Review and apply to your top matches.</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full shrink-0">
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        {/* List Body */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {savedJobs.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                                    <Bookmark className="h-12 w-12 text-[#333742]" />
                                    <div>
                                        <p className="font-semibold text-[#f1f4f8]">No saved jobs yet</p>
                                        <p className="text-sm text-[#94a3b8]">Click the bookmark icon on any job card to save it for later.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {savedJobs.map((job) => (
                                        <div key={job.id} className="group rounded-[1.2rem] border border-[#333742] bg-[#14171f] p-4 transition-all hover:border-[#00e5ff]/50 hover:shadow-lg hover:shadow-[#00e5ff]/10">
                                            <div className="cursor-pointer" onClick={() => { onSelectJob(job); onClose(); }}>
                                                <h4 className="font-semibold text-[#f1f4f8] leading-snug line-clamp-2 group-hover:text-[#00e5ff] transition-colors">{job.title}</h4>
                                                <p className="text-sm text-[#94a3b8] mt-1 truncate">{job.company || 'Unknown Company'}</p>
                                            </div>
                                            <div className="mt-4 flex items-center justify-between">
                                                <Badge variant="outline" className="text-[10px] max-w-[150px] truncate">
                                                    {job.location || job.source || 'Remote'}
                                                </Badge>
                                                <Button variant="ghost" size="sm" onClick={() => onRemove(job.id)} className="h-8 text-red-400 hover:bg-red-500/10 hover:text-red-300">
                                                    <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Remove
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {savedJobs.length > 0 && (
                            <div className="border-t border-[#333742] p-6 bg-[#14171f]">
                                <Button variant="outline" className="w-full text-red-400 border-red-500/30 hover:bg-red-500/10 hover:text-red-300" onClick={onClearAll}>
                                    Clear All Saved Jobs
                                </Button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
const COMPANY_LOGOS = {
    Stripe: '/logos/stripe.png',
    MongoDB: '/logos/mongodb.png',
    Palantir: '/logos/palantir.png',
    HubSpot: '/logos/hubspot.png',
};

function getCompanyInitials(company) {
    if (!company) return '?';

    return company
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((word) => word[0]?.toUpperCase())
        .join('');
}

function getCompanyColor(company) {
    const palettes = [
        'from-cyan-500 to-blue-600',
        'from-emerald-500 to-teal-600',
        'from-violet-500 to-fuchsia-600',
        'from-orange-500 to-red-600',
        'from-sky-500 to-indigo-600',
        'from-indigo-500 to-purple-600',
    ];

    const text = company || 'company';
    let hash = 0;

    for (let i = 0; i < text.length; i++) {
        hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }

    return palettes[Math.abs(hash) % palettes.length];
}

const CompanyLogo = ({ company, logoUrl, size = 'md' }) => {
    const [imgFailed, setImgFailed] = useState(false);

    const sizeClasses = {
        sm: 'h-9 w-9 rounded-lg text-xs',
        md: 'h-10 w-10 rounded-xl text-sm',
        lg: 'h-12 w-12 rounded-xl text-base',
    };

    const classes = sizeClasses[size] || sizeClasses.md;

    if (logoUrl && !imgFailed) {
        return (
            <img
                src={logoUrl}
                alt={company || 'Company'}
                className={`${classes} shrink-0 border border-[#333742] bg-[#0f172a] object-cover`}
                onError={() => setImgFailed(true)}
            />
        );
    }

    return (
        <div
            className={`${classes} shrink-0 border border-[#333742] bg-gradient-to-br ${getCompanyColor(company)} flex items-center justify-center font-bold text-white`}
        >
            {getCompanyInitials(company)}
        </div>
    );
};
const JobCard = ({ job, saved, onToggleSaved, onOptimizeRole, resumeReady, onClick }) => {
    const logoUrl = COMPANY_LOGOS[job.company] || job.company_logo_url || null;
    const workTypeBadges = getWorkTypeBadges(job);
    const experienceLabel = formatExperience(job);
    const salaryLabel = formatSalary(job);

    const companyName =
        job.company && job.company.toUpperCase() !== 'UNKNOWN'
            ? job.company
            : 'Unknown Company';

    return (
        <div
            onClick={() => onClick && onClick(job)}
            className="group relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-[1.8rem] border border-[#333742] bg-[#14171f]/90 p-5 shadow-lg transition-all hover:-translate-y-1 hover:border-[#00e5ff]/40 hover:shadow-[#00e5ff]/10"
        >
            <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                        <CompanyLogo
                            company={job.company}
                            logoUrl={logoUrl}
                            size="md"
                        />

                        <div className="min-w-0">
                            <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-[#94a3b8]">
                                {companyName}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {job.location ? (
                            <Badge variant="outline" className="max-w-[140px] truncate">
                                <MapPin className="mr-1 h-3 w-3" />
                                {job.location}
                            </Badge>
                        ) : null}

                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn("h-8 w-8 rounded-full", saved && "bg-emerald-500/20 text-emerald-400")}
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleSaved(job);
                            }}
                        >
                            {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>

                <h3 className="text-lg font-semibold leading-snug line-clamp-2 text-[#f1f4f8] group-hover:text-[#00e5ff] transition-colors">
                    {job.title}
                </h3>

                <div className="flex flex-wrap gap-2">
                    {workTypeBadges.map((badge) => (
                        <Badge key={badge} variant="outline">
                            {badge}
                        </Badge>
                    ))}

                    {experienceLabel ? (
                        <Badge
                            variant="default"
                            className="bg-[#f5b301]/15 text-[#f5b301] border-[#f5b301]/20"
                        >
                            {experienceLabel}
                        </Badge>
                    ) : null}

                    {salaryLabel ? (
                        <Badge variant="outline">
                            <DollarSign className="mr-1 h-3 w-3" />
                            {salaryLabel}
                        </Badge>
                    ) : null}
                </div>
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 text-xs text-[#94a3b8]">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{getTimeAgo(job.posted_at || job.posted_date || job.created_at)}</span>
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    disabled={!resumeReady}
                    onClick={(e) => {
                        e.stopPropagation();
                        onOptimizeRole(job);
                    }}
                    className="gap-1.5 border-[#00e5ff]/30 text-[#00e5ff] bg-[#00e5ff]/10 hover:bg-[#00e5ff]/20"
                >
                    <WandSparkles className="h-3.5 w-3.5" /> Optimize
                </Button>
            </div>
        </div>
    );
};
function decodeHtmlEntities(value) {
    if (!value) return '';

    const textarea = document.createElement('textarea');
    textarea.innerHTML = value;
    return textarea.value;
}

function getSafeDescriptionHtml(value) {
    const decoded = decodeHtmlEntities(value || '');
    return DOMPurify.sanitize(decoded);
}

const JobDetailDialog = ({ open, onOpenChange, job, saved, onToggleSaved, onOptimizeRole, aiSummary, aiSummaryLoading, optimization, optimizationLoading, resumeReady }) => {
    if (!open || !job) return null;
    return (
        <AnimatePresence>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
                <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-[2rem] border border-[#333742] bg-[#14171f] text-[#f1f4f8] shadow-2xl">
                    <div className="flex items-start justify-between border-b border-[#333742] p-6 bg-[#14171f]/95">
                        <div>
                            <h2 className="text-2xl font-bold leading-tight">{job.title}</h2>
                            <div className="mt-2 flex items-center gap-3">
                                <CompanyLogo
                                    company={job.company}
                                    logoUrl={COMPANY_LOGOS[job.company] || job.company_logo_url || null}
                                    size="md"
                                />
                                <p className="text-[#94a3b8]">{job.company || 'Unknown Company'}</p>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2">
                                {job.location && <Badge variant="outline"><MapPin className="mr-1 h-3.5 w-3.5" />{job.location}</Badge>}
                                {job.remote && <Badge variant="secondary">Remote</Badge>}
                                {job.salary && <Badge variant="outline">{job.salary}</Badge>}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" onClick={() => onToggleSaved(job)} className={cn("rounded-full transition-all", saved ? "bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-700" : "hover:border-[#00e5ff] hover:text-[#00e5ff]")}>
                                {saved ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="rounded-full"><X className="h-5 w-5" /></Button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        <div className="rounded-2xl border border-[#333742] bg-[#1e2129]/50 p-5 shadow-inner">
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">AI Summary</h3>
                            {aiSummaryLoading ? (
                                <div className="mt-4 flex items-center gap-2 text-sm text-[#94a3b8]"><Loader2 className="h-4 w-4 animate-spin" /> Analyzing role...</div>
                            ) : aiSummary ? (
                                <div className="mt-3 space-y-3 text-sm">
                                    <p className="text-[#f1f4f8] leading-relaxed">{aiSummary.summary_short}</p>
                                    <ul className="space-y-2">
                                        {(aiSummary.summary_bullets || []).map((b, i) => <li key={i} className="flex gap-2 text-[#94a3b8]"><Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#00e5ff]" />{b}</li>)}
                                    </ul>
                                </div>
                            ) : <p className="mt-3 text-sm text-[#94a3b8]">Summary unavailable.</p>}
                        </div>

                        {(optimization || optimizationLoading) && (
                            <div className="rounded-2xl border border-[#00e5ff]/30 bg-[#00e5ff]/5 p-5">
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#00e5ff]">Resume Optimization</h3>
                                {optimizationLoading ? (
                                    <div className="mt-4 flex items-center gap-2 text-sm text-[#00e5ff]"><Loader2 className="h-4 w-4 animate-spin" /> Tailoring resume...</div>
                                ) : optimization ? (
                                    <div className="mt-3 space-y-3 text-sm">
                                        <p className="leading-relaxed">{optimization.tailored_summary}</p>
                                        <ul className="space-y-2">
                                            {(optimization.rewritten_bullets || []).map((b, i) => <li key={i} className="flex gap-2 text-[#94a3b8]"><Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#00e5ff]" />{b}</li>)}
                                        </ul>
                                    </div>
                                ) : null}
                            </div>
                        )}

                        <div>
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#94a3b8] mb-3">Description</h3>
                            <div
                                className="prose prose-invert max-w-none text-sm leading-relaxed text-[#94a3b8]"
                                dangerouslySetInnerHTML={{
                                    __html: getSafeDescriptionHtml(job.description || '<p>No description available.</p>')
                                }}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-[#333742] bg-[#14171f] p-5">
                        {/* Left Side: Apply Button (Now using the Outline/Secondary style) */}
                        <div>
                            {job.url && (
                                <a
                                    href={job.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[#00e5ff]/30 px-4 py-2 text-sm font-medium text-[#00e5ff] transition-all hover:bg-[#00e5ff]/10"
                                >
                                    Apply <ExternalLink className="h-4 w-4" />
                                </a>
                            )}
                        </div>

                        {/* Right Side: Close & Optimize Buttons */}
                        <div className="flex items-center gap-3">
                            <Button variant="ghost" onClick={() => onOpenChange(false)}>
                                Close
                            </Button>

                            {/* Optimize Button (Now using the Solid/Primary style) */}
                            <Button

                                disabled={!resumeReady || optimizationLoading}
                                onClick={() => onOptimizeRole(job)}
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border-0 bg-[#00e5ff] px-4 py-2 text-sm font-semibold text-[#0b0e14] shadow-lg shadow-[#00e5ff]/20 transition-all hover:scale-105 hover:bg-[#00e5ff]/90"
                            >
                                {optimizationLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <WandSparkles className="h-4 w-4" />}
                                Optimize For This Role
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

const ResumeLabPanel = ({ resumeFileName, resumeText, critiqueLevel, onCritiqueLevelChange, onUpload, onClear, onAnalyze, isExtracting, isAnalyzing, analysis, error }) => {
    const ready = !!resumeText.trim();
    return (
        <div className="flex h-full flex-col rounded-[2rem] border border-[#333742] bg-[#14171f]/80 p-6 shadow-xl backdrop-blur-md">
            <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#94a3b8]">Resume Lab</p>
                <h3 className="mt-1 text-xl font-bold text-[#f1f4f8]">AI Optimization</h3>
                <p className="text-xs text-[#94a3b8] mt-1">Upload a resume to analyze strengths and tailor it to jobs.</p>
            </div>

            <div className="mt-6 space-y-4">
                <label className="block cursor-pointer">
                    <span className="mb-2 block text-xs font-medium uppercase text-[#94a3b8]">Upload Document</span>
                    <Input type="file" accept=".pdf,.docx,.txt" className="cursor-pointer" onChange={(e) => { if (e.target.files?.[0]) onUpload(e.target.files[0]); }} disabled={isExtracting} />
                </label>

                <div className="rounded-xl border border-[#333742] bg-[#1e2129]/50 p-4">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-[#94a3b8]">Current File</span>
                        {resumeFileName && <Button variant="ghost" size="sm" onClick={onClear} className="h-6 px-2 text-xs"><Trash2 className="mr-1 h-3 w-3" /> Clear</Button>}
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-sm font-medium text-[#f1f4f8]">
                        <FileText className="h-4 w-4 text-[#00e5ff]" />
                        <span className="truncate">{resumeFileName || 'None loaded'}</span>
                    </div>
                </div>

                <div>
                    <span className="mb-2 block text-xs font-medium uppercase text-[#94a3b8]">Critique Level</span>
                    <div className="relative">
                        <select value={critiqueLevel} onChange={(e) => onCritiqueLevelChange(e.target.value)} className="w-full appearance-none cursor-pointer rounded-xl border border-[#333742] bg-[#1e2129]/50 p-2.5 text-sm text-[#f1f4f8] focus:outline-none focus:ring-2 focus:ring-[#00e5ff]/50">
                            <option value="light">Light</option>
                            <option value="balanced">Balanced</option>
                            <option value="hardcore">Hardcore</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94a3b8] pointer-events-none" />
                    </div>
                </div>

                <Button className="w-full shadow-lg shadow-[#00e5ff]/20" disabled={!ready || isAnalyzing || isExtracting} onClick={onAnalyze}>
                    {isAnalyzing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</> : <><WandSparkles className="mr-2 h-4 w-4" /> Analyze Resume</>}
                </Button>
                {error && <div className="rounded-lg bg-red-500/10 p-3 text-xs text-red-400 border border-red-500/20">{error}</div>}
            </div>

            <div className="mt-6 flex-1 overflow-auto rounded-xl border border-[#333742] bg-[#1e2129]/30 p-4 shadow-inner">
                {!analysis ? (
                    <p className="text-xs text-[#94a3b8] leading-relaxed">Run an analysis to get your baseline score, strengths, and actionable feedback before applying.</p>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-[#f1f4f8]">Overall Score</span>
                            <Badge className="bg-[#00e5ff] text-[#0b0e14]">{analysis.score}/100</Badge>
                        </div>
                        <p className="text-xs text-[#94a3b8]">{analysis.headline}</p>
                        <div>
                            <p className="text-[11px] font-semibold uppercase text-[#94a3b8] mb-1">Top Strengths</p>
                            <ul className="text-xs space-y-1.5 text-[#f1f4f8]">{(analysis.strengths || []).map((s, i) => <li key={i}>• {s}</li>)}</ul>
                        </div>
                        <div>
                            <p className="text-[11px] font-semibold uppercase text-[#94a3b8] mb-1">Priority Actions</p>
                            <ul className="text-xs space-y-1.5 text-[#f1f4f8]">{(analysis.priority_actions || []).map((a, i) => <li key={i}>• {a}</li>)}</ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const FilterBar = ({ filters, setFilters }) => {
    const [localQ, setLocalQ] = useState(filters.q);
    const debouncedQ = useDebounce(localQ, 400);

    useEffect(() => {
        setLocalQ(filters.q || '');
    }, [filters.q]);

    useEffect(() => {
        setFilters(prev => {
            if (prev.q === debouncedQ) return prev;
            return { ...prev, q: debouncedQ };
        });
    }, [debouncedQ, setFilters]);

    return (
        <div className="flex flex-col gap-4 rounded-[1.8rem] border border-[#333742] bg-[#14171f]/80 p-5 shadow-lg backdrop-blur-md lg:flex-row lg:items-center">
            <div className="relative flex-1 group">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94a3b8] group-focus-within:text-[#00e5ff] transition-colors" />
                <Input
                    placeholder="Search roles, skills, or companies..."
                    value={localQ}
                    onChange={(e) => setLocalQ(e.target.value)}
                    className="pl-9"
                />
            </div>

            <div className="relative w-full lg:w-48 group">
                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94a3b8] group-focus-within:text-[#00e5ff] transition-colors" />
                <Input
                    placeholder="Location"
                    value={filters.location}
                    onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                    className="pl-9"
                />
            </div>


            <Button
                variant={filters.remote ? "default" : "outline"}
                onClick={() => setFilters(prev => ({ ...prev, remote: !prev.remote }))}
                className="w-full lg:w-auto shrink-0"
            >
                Remote Only
            </Button>

            {(filters.q || filters.location || filters.source || filters.remote) && (
                <Button
                    variant="ghost"
                    onClick={() => {
                        setLocalQ('');
                        setFilters({ q: '', location: '', source: '', remote: false });
                    }}
                >
                    Clear
                </Button>
            )}
        </div>
    );
};

// --------------------------------------------------------------------------
// Main Page Layout
// --------------------------------------------------------------------------

function JobsPage() {
    const [searchParams] = useSearchParams();

    const [filters, setFilters] = useState({
        q: searchParams.get('q') || '',
        location: '',
        source: '',
        remote: false
    });

    useEffect(() => {
        const q = searchParams.get('q') || '';

        setFilters(prev => {
            if (prev.q === q) return prev;
            return { ...prev, q };
        });
    }, [searchParams]);

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useJobsList(filters);
    const jobs = useMemo(() => {
        const allJobs = data?.pages.flatMap((p) => p.data) || [];

        return [...allJobs].sort((a, b) => {
            const aDate = new Date(a.posted_at || a.posted_date || a.created_at || 0).getTime();
            const bDate = new Date(b.posted_at || b.posted_date || b.created_at || 0).getTime();

            return bDate - aDate;
        });
    }, [data]);

    const { savedJobs, isJobSaved, toggleSaved, unsaveJob, clearAll } = useSavedJobs();

    const [selectedJob, setSelectedJob] = useState(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState(false); // <--- Drawer State

    const [guestResume, setGuestResume] = useState({ fileName: null, text: '' });
    const [critiqueLevel, setCritiqueLevel] = useState('balanced');
    const [resumeAnalysis, setResumeAnalysis] = useState(null);
    const [resumeError, setResumeError] = useState(null);
    const [isExtracting, setIsExtracting] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const [jobSummaryById, setJobSummaryById] = useState({});
    const [summaryLoadingById, setSummaryLoadingById] = useState({});
    const [jobOptimizationById, setJobOptimizationById] = useState({});
    const [optimizationLoadingById, setOptimizationLoadingById] = useState({});

    const resumeReady = !!guestResume.text.trim();

    const handleDetails = async (job) => {
        setSelectedJob(job);
        setDetailOpen(true);
        if (!jobSummaryById[job.id] && !summaryLoadingById[job.id]) {
            setSummaryLoadingById(p => ({ ...p, [job.id]: true }));
            try {
                const sum = await api.ai.summary(job.id);
                setJobSummaryById(p => ({ ...p, [job.id]: sum }));
            } catch (e) { } finally {
                setSummaryLoadingById(p => ({ ...p, [job.id]: false }));
            }
        }
    };

    const handleUpload = async (file) => {
        setIsExtracting(true);
        setResumeError(null);
        try {
            const res = await api.ai.extractResume(file);
            setGuestResume({ fileName: file.name, text: res.text || '' });
        } catch (e) {
            setResumeError('Failed to extract text from file.');
        } finally {
            setIsExtracting(false);
        }
    };

    const handleAnalyze = async () => {
        if (!resumeReady) return;
        setIsAnalyzing(true);
        setResumeError(null);
        try {
            const res = await api.ai.analyzeResume(guestResume.text, critiqueLevel);
            setResumeAnalysis(res);
        } catch (e) {
            setResumeError('Analysis failed.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleOptimize = async (job) => {
        if (!resumeReady) return;
        setOptimizationLoadingById(p => ({ ...p, [job.id]: true }));
        try {
            const res = await api.ai.optimizeResumeForJob(job.id, guestResume.text, critiqueLevel);
            setJobOptimizationById(p => ({ ...p, [job.id]: res }));
            handleDetails(job);
        } catch (e) { } finally {
            setOptimizationLoadingById(p => ({ ...p, [job.id]: false }));
        }
    };

    return (
        <div className="pb-12 font-sans selection:bg-[#00e5ff]/20">
            <div className="mx-auto w-full max-w-[1800px] px-4 py-8 lg:px-8">

                {/* Header Block */}
                <header className="mb-8 rounded-[2rem] border border-[#333742] bg-[#14171f]/80 p-6 shadow-xl backdrop-blur-md lg:p-10">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#00e5ff]">Job Board</p>
                            <h1 className="mt-2 text-4xl font-extrabold tracking-tight sm:text-5xl">Shape your job hunt<br />around signal, not noise.</h1>
                        </div>
                        <div className="flex gap-4">
                            <div className="rounded-2xl border border-[#333742] bg-[#1e2129]/50 p-4 min-w-[120px]">
                                <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-[#94a3b8]"><BarChart3 className="h-3.5 w-3.5" /> Loaded</div>
                                <div className="mt-2 text-2xl font-bold">{jobs.length}</div>
                            </div>

                            {/* Clickable Saved Box triggers the Drawer */}
                            <div
                                className="rounded-2xl border border-[#333742] bg-[#1e2129]/50 p-4 min-w-[120px] cursor-pointer transition-all hover:bg-[#1e2129] hover:border-[#00e5ff]/50 hover:shadow-lg hover:shadow-[#00e5ff]/10"
                                onClick={() => setIsSavedDrawerOpen(true)}
                            >
                                <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-[#00e5ff]"><Compass className="h-3.5 w-3.5" /> Saved</div>
                                <div className="mt-2 text-2xl font-bold text-[#00e5ff]">{savedJobs.length}</div>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="grid gap-8 xl:grid-cols-[1fr_360px] 2xl:grid-cols-[1fr_400px]">
                    <main className="space-y-6">
                        <FilterBar filters={filters} setFilters={setFilters} />

                        {isLoading ? (
                            <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[#94a3b8]" /></div>
                        ) : jobs.length === 0 ? (
                            <div className="flex h-64 flex-col items-center justify-center rounded-[2rem] border border-[#333742] bg-[#14171f]/50">
                                <Briefcase className="h-12 w-12 text-[#94a3b8]/50 mb-4" />
                                <h3 className="text-xl font-semibold">No jobs found</h3>
                                <p className="text-[#94a3b8] mt-2">Adjust your filters to see more results.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                                {jobs.map((job) => (
                                    <JobCard
                                        key={job.id}
                                        job={job}
                                        saved={isJobSaved(job)}
                                        onToggleSaved={toggleSaved}
                                        onOptimizeRole={handleOptimize}
                                        resumeReady={resumeReady}
                                        onClick={handleDetails}
                                    />
                                ))}
                            </div>
                        )}

                        {hasNextPage && (
                            <div className="flex justify-center pt-8">
                                <Button size="lg" variant="outline" onClick={() => fetchNextPage()} disabled={isFetchingNextPage} className="shadow-lg shadow-black/20">
                                    {isFetchingNextPage ? <Loader2 className="mr-2 h-5 w-5 animate-spin text-[#00e5ff]" /> : <ChevronUp className="mr-2 h-5 w-5 rotate-180 text-[#00e5ff]" />}
                                    {isFetchingNextPage ? 'Loading...' : 'Load More Jobs'}
                                </Button>
                            </div>
                        )}
                    </main>

                    <aside className="hidden xl:block xl:sticky xl:top-8 xl:h-[calc(100vh-4rem)]">
                        <ResumeLabPanel
                            resumeFileName={guestResume.fileName}
                            resumeText={guestResume.text}
                            critiqueLevel={critiqueLevel}
                            onCritiqueLevelChange={setCritiqueLevel}
                            onUpload={handleUpload}
                            onClear={() => { setGuestResume({ fileName: null, text: '' }); setResumeAnalysis(null); }}
                            onAnalyze={handleAnalyze}
                            isExtracting={isExtracting}
                            isAnalyzing={isAnalyzing}
                            analysis={resumeAnalysis}
                            error={resumeError}
                        />
                    </aside>
                </div>
            </div>

            {/* Detail Dialog */}
            <JobDetailDialog
                open={detailOpen}
                onOpenChange={setDetailOpen}
                job={selectedJob}
                saved={selectedJob ? isJobSaved(selectedJob) : false}
                onToggleSaved={toggleSaved}
                onOptimizeRole={handleOptimize}
                resumeReady={resumeReady}
                aiSummary={selectedJob ? jobSummaryById[selectedJob.id] : null}
                aiSummaryLoading={selectedJob ? summaryLoadingById[selectedJob.id] : false}
                optimization={selectedJob ? jobOptimizationById[selectedJob.id] : null}
                optimizationLoading={selectedJob ? optimizationLoadingById[selectedJob.id] : false}
            />

            {/* Slide-in Saved Jobs Drawer */}
            <SavedJobsDrawer
                isOpen={isSavedDrawerOpen}
                onClose={() => setIsSavedDrawerOpen(false)}
                savedJobs={savedJobs}
                onSelectJob={handleDetails}
                onRemove={unsaveJob}
                onClearAll={clearAll}
            />
        </div>
    );
}

const queryClient = new QueryClient({
    defaultOptions: { queries: { staleTime: Infinity, refetchOnWindowFocus: false, retry: 1 } }
});

const JobBoard = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <JobsPage />
        </QueryClientProvider>
    );
};

export default JobBoard;