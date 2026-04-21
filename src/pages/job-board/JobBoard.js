// src/pages/job-board/JobBoard.js
//
// Merged JobBoard: combines the existing renaisons.com job board with features
// from the "bruh" (Vite/TS) frontend:
//   - FastAPI backend on https://api.renaisons.com (configurable via env)
//   - Cursor-based pagination (/api/v1/jobs)
//   - Recommended jobs carousel (/api/v1/jobs/recommended)
//   - Per-job match score (/api/v1/jobs/{id}/match)
//   - Resume match profile auto-extraction (/api/v1/resume/match-profile)
//   - Mobile swipe card stack (< 640px)
//   - High-contrast toggle (localStorage persisted)
//   - Guest user ID in sessionStorage for resume-upload association
//
// Auth/resume/articles still call https://renaisons.com (your PHP backend).
// Only the job-board data layer talks to the FastAPI backend.

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    QueryClient,
    QueryClientProvider,
    useInfiniteQuery,
    useQuery,
} from '@tanstack/react-query';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
    Search, MapPin, Briefcase, Bookmark, BookmarkCheck, Clock, DollarSign,
    X, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Heart, WandSparkles,
    Loader2, Trash2, ExternalLink, Upload, FileText, Sparkles, BarChart3,
    Compass, ShieldCheck, ArrowUpRight, Eye, EyeOff,
} from 'lucide-react';
import DOMPurify from 'dompurify';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

/* -------------------------------------------------------------------------
 *  Config & constants
 * ---------------------------------------------------------------------- */

// FastAPI backend (bruh2) — deployed on the VPS, reverse-proxied via nginx.
// Set REACT_APP_JOBS_API_URL in your Hostinger build env.
const JOBS_API_URL = process.env.REACT_APP_JOBS_API_URL || 'https://api.renaisons.com';
const JOBS_API_KEY = process.env.REACT_APP_JOBS_API_KEY || '';

// PHP backend (for resume upload/extract + AI summary/optimize that your site
// already uses). Keep calling renaisons.com for these.
const SITE_API_URL = process.env.REACT_APP_API_URL || 'https://renaisons.com';

const PAGE_SIZE = 48;
const CONTRAST_STORAGE_KEY = 'job_feed_high_contrast';
const GUEST_USER_ID_KEY = 'guest_user_id';

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

/* -------------------------------------------------------------------------
 *  Helpers
 * ---------------------------------------------------------------------- */

function getOrCreateGuestUserId() {
    if (typeof window === 'undefined') return 'guest';
    const stored = window.sessionStorage.getItem(GUEST_USER_ID_KEY);
    if (stored) return stored;
    const id =
        typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : `guest-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    window.sessionStorage.setItem(GUEST_USER_ID_KEY, id);
    return id;
}

function getInitialContrast() {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(CONTRAST_STORAGE_KEY) === 'true';
}

function formatPosted(dateString) {
    if (!dateString) return 'Recently';
    try {
        const then = new Date(dateString).getTime();
        const diff = Date.now() - then;
        const days = Math.floor(diff / 86400000);
        if (days < 1) return 'Today';
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days}d ago`;
        if (days < 30) return `${Math.floor(days / 7)}w ago`;
        return `${Math.floor(days / 30)}mo ago`;
    } catch {
        return 'Recently';
    }
}

async function apiFetch(path, opts = {}) {
    const url = `${JOBS_API_URL}${path}`;
    const isForm = typeof FormData !== 'undefined' && opts.body instanceof FormData;
    const res = await fetch(url, {
        ...opts,
        headers: {
            ...(isForm ? {} : { 'Content-Type': 'application/json' }),
            ...(JOBS_API_KEY ? { 'X-API-Key': JOBS_API_KEY } : {}),
            ...(opts.headers || {}),
        },
    });
    if (!res.ok) {
        let detail = `HTTP ${res.status}`;
        try {
            const body = await res.json();
            detail = body.detail || detail;
        } catch { /* ignore */ }
        throw new Error(detail);
    }
    return res.json();
}

/* -------------------------------------------------------------------------
 *  API client (FastAPI backend)
 * ---------------------------------------------------------------------- */

const api = {
    jobs: {
        list: async ({ pageParam = null, q, location, source, remote }) => {
            const params = new URLSearchParams({
                limit: String(PAGE_SIZE),
                active_only: 'false',
                stale_after_days: '60',
                posted_within_days: '14',
            });
            if (pageParam) params.append('cursor', pageParam);
            if (q) params.append('q', q);
            if (location) params.append('location', location);
            if (source) params.append('source', source);
            if (remote) params.append('remote', 'true');
            return apiFetch(`/api/v1/jobs?${params}`);
        },
        recommended: async ({ skills, experienceYears, userId }) => {
            const params = new URLSearchParams({
                limit: '8',
                active_only: 'false',
                stale_after_days: '60',
            });
            if (skills && skills.length) {
                params.append('profile_skills', skills.join(','));
            }
            if (experienceYears !== null && experienceYears !== undefined) {
                params.append('profile_experience_years', String(experienceYears));
            }
            if (userId) params.append('user_id', userId);
            return apiFetch(`/api/v1/jobs/recommended?${params}`);
        },
        matchScore: async (jobId, skills, experienceYears) =>
            apiFetch(`/api/v1/jobs/${jobId}/match`, {
                method: 'POST',
                body: JSON.stringify({
                    profile_skills: skills,
                    profile_experience_years: experienceYears,
                }),
            }),
        summary: async (jobId) => apiFetch(`/api/v1/jobs/${jobId}/summary`, {
            method: 'POST',
            body: JSON.stringify({}),
        }),
    },
    resume: {
        upload: async (userId, file) => {
            const form = new FormData();
            form.append('file', file);
            return apiFetch(`/api/v1/resume?user_id=${encodeURIComponent(userId)}`, {
                method: 'POST',
                body: form,
            });
        },
        matchProfile: async (userId) =>
            apiFetch(`/api/v1/resume/match-profile?user_id=${encodeURIComponent(userId)}`),
        analyze: async (userId, critiqueLevel) =>
            apiFetch(`/api/v1/resume/analyze?user_id=${encodeURIComponent(userId)}`, {
                method: 'POST',
                body: JSON.stringify({ critique_level: critiqueLevel }),
            }),
        optimize: async (jobId, userId, mode) =>
            apiFetch(`/api/v1/jobs/${jobId}/optimize-resume?user_id=${encodeURIComponent(userId)}`, {
                method: 'POST',
                body: JSON.stringify({ mode }),
            }),
    },
};

/* -------------------------------------------------------------------------
 *  Hooks
 * ---------------------------------------------------------------------- */

function useMediaQuery(query) {
    const [matches, setMatches] = useState(() => {
        if (typeof window === 'undefined') return false;
        return window.matchMedia(query).matches;
    });
    useEffect(() => {
        const mq = window.matchMedia(query);
        const onChange = (e) => setMatches(e.matches);
        mq.addEventListener('change', onChange);
        return () => mq.removeEventListener('change', onChange);
    }, [query]);
    return matches;
}

function useSavedJobs() {
    const [savedJobs, setSavedJobs] = useState(() => {
        try {
            const raw = localStorage.getItem('saved_jobs');
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem('saved_jobs', JSON.stringify(savedJobs));
    }, [savedJobs]);

    const isJobSaved = useCallback(
        (job) => savedJobs.some((j) => j.id === job.id),
        [savedJobs],
    );

    const toggleSaved = useCallback((job) => {
        setSavedJobs((prev) =>
            prev.some((j) => j.id === job.id)
                ? prev.filter((j) => j.id !== job.id)
                : [...prev, job],
        );
    }, []);

    const unsaveJob = useCallback((job) => {
        setSavedJobs((prev) => prev.filter((j) => j.id !== job.id));
    }, []);

    const clearAll = useCallback(() => setSavedJobs([]), []);

    return { savedJobs, isJobSaved, toggleSaved, unsaveJob, clearAll };
}

/* -------------------------------------------------------------------------
 *  Small presentational primitives
 * ---------------------------------------------------------------------- */

const Button = React.forwardRef(function Button(
    { className, variant = 'default', size = 'default', children, ...props },
    ref,
) {
    const variants = {
        default: 'bg-[#00e5ff] text-black hover:bg-[#00e5ff]/90',
        outline: 'border border-[#333742] bg-transparent hover:bg-white/5',
        ghost: 'bg-transparent hover:bg-white/5',
        destructive: 'bg-red-600 text-white hover:bg-red-700',
    };
    const sizes = {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 px-3 text-sm',
        lg: 'h-12 px-6 text-base',
        icon: 'h-10 w-10',
    };
    return (
        <button
            ref={ref}
            className={cn(
                'inline-flex items-center justify-center rounded-full font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
                variants[variant],
                sizes[size],
                className,
            )}
            {...props}
        >
            {children}
        </button>
    );
});

function Badge({ className, children, ...props }) {
    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full border border-[#333742] bg-white/5 px-2.5 py-0.5 text-xs font-medium',
                className,
            )}
            {...props}
        >
            {children}
        </span>
    );
}

function MatchScorePill({ score, loading }) {
    if (loading) {
        return (
            <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-white/50">
                <Loader2 className="h-3 w-3 animate-spin" />
                scoring
            </span>
        );
    }
    if (score === null || score === undefined) return null;
    const pct = typeof score === 'object'
        ? Math.round(score.match_score ?? score.score ?? 0)
        : Math.round(score);
    const color =
        pct >= 75 ? 'bg-emerald-400/15 border-emerald-400/30 text-emerald-300'
            : pct >= 50 ? 'bg-amber-400/15 border-amber-400/30 text-amber-300'
                : 'bg-white/5 border-white/10 text-white/60';
    return (
        <span
            className={cn(
                'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold tabular-nums',
                color,
            )}
            title="Match score vs your resume"
        >
            <Sparkles className="h-3 w-3" />
            {pct}% match
        </span>
    );
}

/* -------------------------------------------------------------------------
 *  Job card (grid view)
 * ---------------------------------------------------------------------- */

function JobCard({
    job,
    saved,
    onToggleSaved,
    onOptimizeRole,
    resumeReady,
    onClick,
    matchScore,
    matchScoreLoading,
}) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            whileHover={{ y: -4 }}
            onClick={() => onClick(job)}
            className="group cursor-pointer rounded-[1.75rem] border border-[#333742] bg-[#14171f]/70 p-5 backdrop-blur-sm transition-colors hover:border-[#00e5ff]/30"
        >
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-[#94a3b8]">
                        <span className="truncate">{job.source || 'Unknown'}</span>
                        {job.remote && <span className="text-[#00e5ff]">• Remote</span>}
                    </div>
                    <h3 className="mt-2 line-clamp-2 text-lg font-semibold text-white">
                        {job.title}
                    </h3>
                    <div className="mt-1 text-sm text-[#94a3b8]">
                        {job.company || 'Unknown company'}
                    </div>
                </div>
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleSaved(job);
                    }}
                    className="shrink-0 rounded-full border border-white/10 bg-white/5 p-2 text-white/70 transition-colors hover:border-white/20 hover:bg-white/10"
                    aria-label={saved ? 'Unsave job' : 'Save job'}
                >
                    {saved ? <BookmarkCheck className="h-4 w-4 text-[#00e5ff]" /> : <Bookmark className="h-4 w-4" />}
                </button>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-[#94a3b8]">
                {job.location && (
                    <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {job.location}
                    </span>
                )}
                {job.salary && (
                    <span className="inline-flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {job.salary}
                    </span>
                )}
                <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatPosted(job.posted_date)}
                </span>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
                <MatchScorePill score={matchScore} loading={matchScoreLoading} />
                {job.employment_type && (
                    <Badge className="text-[10px]">{job.employment_type}</Badge>
                )}
            </div>

            <div className="mt-4 flex items-center justify-between">
                <button
                    type="button"
                    disabled={!resumeReady}
                    onClick={(e) => {
                        e.stopPropagation();
                        onOptimizeRole(job);
                    }}
                    className={cn(
                        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                        resumeReady
                            ? 'border-[#00e5ff]/30 bg-[#00e5ff]/10 text-[#00e5ff] hover:bg-[#00e5ff]/15'
                            : 'cursor-not-allowed border-white/5 bg-white/[0.02] text-white/30',
                    )}
                    title={resumeReady ? 'Optimize resume for this role' : 'Upload a resume first'}
                >
                    <WandSparkles className="h-3.5 w-3.5" />
                    Optimize
                </button>
                <ExternalLink className="h-3.5 w-3.5 text-white/30 transition-colors group-hover:text-[#00e5ff]" />
            </div>
        </motion.div>
    );
}

/* -------------------------------------------------------------------------
 *  Featured / recommended carousel
 * ---------------------------------------------------------------------- */

function RecommendedCarousel({ jobs, isLoading, onJobClick, isJobSaved, onToggleSaved }) {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        if (!jobs.length || jobs.length <= 1) return;
        const id = setInterval(() => setIndex((i) => (i + 1) % jobs.length), 7000);
        return () => clearInterval(id);
    }, [jobs.length]);

    if (isLoading) {
        return (
            <div className="rounded-[2rem] border border-[#333742] bg-[#14171f]/50 p-12 text-center">
                <Loader2 className="mx-auto h-6 w-6 animate-spin text-[#00e5ff]" />
                <div className="mt-3 text-sm text-[#94a3b8]">Finding recommendations...</div>
            </div>
        );
    }

    if (!jobs.length) return null;

    const job = jobs[index];
    const saved = isJobSaved(job);

    return (
        <div className="overflow-hidden rounded-[2rem] border border-[#333742] bg-gradient-to-b from-white/[0.04] to-white/[0.01] shadow-[0_28px_90px_-40px_rgba(0,0,0,0.92)] backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
                <div className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-[#00e5ff] shadow-[0_0_18px_rgba(0,229,255,0.75)]" />
                    <span className="text-[11px] uppercase tracking-[0.24em] text-white/45">
                        Featured for you
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setIndex((i) => (i - 1 + jobs.length) % jobs.length)}
                        className="rounded-full border border-white/10 bg-white/5 p-1.5 text-white/60 hover:border-white/20 hover:bg-white/10 hover:text-white"
                        aria-label="Previous"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="text-xs tabular-nums text-white/45">
                        {index + 1} / {jobs.length}
                    </span>
                    <button
                        type="button"
                        onClick={() => setIndex((i) => (i + 1) % jobs.length)}
                        className="rounded-full border border-white/10 bg-white/5 p-1.5 text-white/60 hover:border-white/20 hover:bg-white/10 hover:text-white"
                        aria-label="Next"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={job.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                    className="grid gap-6 p-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]"
                >
                    <div>
                        <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                                <div className="text-[11px] uppercase tracking-[0.24em] text-white/45">
                                    {job.source || 'Recommended'}
                                </div>
                                <h3 className="mt-3 line-clamp-2 text-3xl font-semibold leading-tight text-white sm:text-4xl">
                                    {job.title}
                                </h3>
                                <div className="mt-3 text-base font-medium text-white/72">
                                    {job.company || 'Unknown company'}
                                </div>
                                <div className="mt-1 text-sm text-white/50">
                                    {job.location || 'Location not listed'}
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); onToggleSaved(job); }}
                                className={cn(
                                    'flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-all',
                                    saved
                                        ? 'border-white/20 bg-white/[0.14] text-white'
                                        : 'border-white/10 bg-white/[0.05] text-white/60 hover:border-white/20 hover:text-white',
                                )}
                                aria-label={saved ? 'Unsave' : 'Save'}
                            >
                                {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                            </button>
                        </div>

                        {typeof job.recommendation_score === 'number' && (
                            <div className="mt-4">
                                <MatchScorePill score={job.recommendation_score} />
                            </div>
                        )}

                        {Array.isArray(job.recommendation_reasons) && job.recommendation_reasons.length > 0 && (
                            <ul className="mt-5 space-y-2">
                                {job.recommendation_reasons.slice(0, 3).map((r, i) => (
                                    <li key={i} className="flex gap-3 text-sm leading-6 text-white/72">
                                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#00e5ff]/60" />
                                        <span>{r}</span>
                                    </li>
                                ))}
                            </ul>
                        )}

                        <button
                            type="button"
                            onClick={() => onJobClick(job)}
                            className="mt-6 inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.08] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/[0.12]"
                        >
                            Open role
                            <ArrowUpRight className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="rounded-[1.4rem] border border-white/10 bg-black/20 p-5">
                        <div className="text-[11px] uppercase tracking-[0.24em] text-white/45">
                            Role details
                        </div>
                        <dl className="mt-4 space-y-3 text-sm">
                            {job.salary && (
                                <div className="flex justify-between gap-4">
                                    <dt className="text-white/50">Compensation</dt>
                                    <dd className="text-right text-white/80">{job.salary}</dd>
                                </div>
                            )}
                            {job.employment_type && (
                                <div className="flex justify-between gap-4">
                                    <dt className="text-white/50">Type</dt>
                                    <dd className="text-right text-white/80">{job.employment_type}</dd>
                                </div>
                            )}
                            {job.experience_level && (
                                <div className="flex justify-between gap-4">
                                    <dt className="text-white/50">Level</dt>
                                    <dd className="text-right text-white/80">{job.experience_level}</dd>
                                </div>
                            )}
                            <div className="flex justify-between gap-4">
                                <dt className="text-white/50">Posted</dt>
                                <dd className="text-right text-white/80">{formatPosted(job.posted_date)}</dd>
                            </div>
                        </dl>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

/* -------------------------------------------------------------------------
 *  Mobile swipe card stack
 * ---------------------------------------------------------------------- */

function SwipeCard({ job, saved, onOpen, onToggleSaved }) {
    return (
        <div
            onClick={onOpen}
            className="h-full w-full cursor-pointer rounded-[2rem] border border-white/10 bg-gradient-to-b from-white/[0.09] to-white/[0.02] p-6 shadow-2xl shadow-black/50 backdrop-blur-sm"
        >
            <div className="flex h-full flex-col">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <div className="text-[11px] uppercase tracking-wider text-white/50">
                            {job.source || 'Unknown'}
                        </div>
                        <h3 className="mt-2 line-clamp-2 text-xl font-semibold text-white">
                            {job.title}
                        </h3>
                        <div className="mt-1 text-sm text-white/70">
                            {job.company || 'Unknown company'}
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onToggleSaved(); }}
                        onPointerDown={(e) => e.stopPropagation()}
                        className="rounded-full border border-white/10 bg-white/5 p-2 text-white/70"
                    >
                        {saved ? <BookmarkCheck className="h-4 w-4 text-[#00e5ff]" /> : <Bookmark className="h-4 w-4" />}
                    </button>
                </div>

                <div className="mt-5 space-y-2 text-sm text-white/72">
                    {job.location && (
                        <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-white/40" />
                            {job.location}
                        </div>
                    )}
                    {job.salary && (
                        <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-white/40" />
                            {job.salary}
                        </div>
                    )}
                </div>

                <div className="mt-auto flex items-center justify-between pt-6 text-xs text-white/50">
                    <span>{formatPosted(job.posted_date)}</span>
                    <span className="flex items-center gap-4">
                        <X className="h-5 w-5 text-red-400/60" />
                        <Heart className="h-5 w-5 text-[#00e5ff]/80" />
                    </span>
                </div>
            </div>
        </div>
    );
}

function JobCardStack({
    jobs,
    index,
    onAdvance,
    onSave,
    onToggleSaved,
    onDismiss,
    onDetails,
    isJobSaved,
    isFetchingNextPage,
}) {
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 0, 200], [-18, 0, 18]);
    const opacity = useTransform(x, [-200, 0, 200], [0.6, 1, 0.6]);
    const flying = useRef(false);

    const current = jobs[index] ?? null;
    const next = jobs[index + 1] ?? null;

    const finish = useCallback(
        async (direction) => {
            if (flying.current || !current) return;
            flying.current = true;
            const target = direction === 'right' ? 500 : -500;
            await Promise.all([
                animate(x, target, { duration: 0.22, ease: 'easeOut' }),
                animate(opacity, 0, { duration: 0.22, ease: 'easeOut' }),
            ]);
            if (direction === 'right') onSave(current);
            else onDismiss(current);
            onAdvance();
            // reset for next card
            x.set(0);
            opacity.set(1);
            flying.current = false;
        },
        [current, onAdvance, onDismiss, onSave, opacity, x],
    );

    const handleDragEnd = (_, info) => {
        if (!current) return;
        if (info.offset.x > 80 || info.velocity.x > 500) {
            void finish('right');
        } else if (info.offset.x < -80 || info.velocity.x < -500) {
            void finish('left');
        }
    };

    if (!current) {
        if (isFetchingNextPage) {
            return (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Loader2 className="mb-3 h-6 w-6 animate-spin text-[#94a3b8]" />
                    <div className="text-sm text-[#94a3b8]">Loading more jobs...</div>
                </div>
            );
        }
        return (
            <div className="flex flex-col items-center justify-center rounded-[2rem] border border-[#333742] bg-[#14171f]/50 py-16 text-center">
                <Bookmark className="mb-4 h-12 w-12 text-[#94a3b8]/50" />
                <div className="text-xl font-semibold text-white">No more jobs</div>
                <div className="mt-2 max-w-xs text-sm text-[#94a3b8]">
                    Try changing filters or check back later.
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-[22rem]">
            <div className="relative h-[480px]">
                {next && (
                    <div className="absolute inset-0 translate-y-2 scale-[0.985] opacity-70">
                        <SwipeCard
                            job={next}
                            saved={isJobSaved(next)}
                            onOpen={() => onDetails(next)}
                            onToggleSaved={() => onToggleSaved(next)}
                        />
                    </div>
                )}

                <motion.div
                    key={current.id}
                    className="absolute inset-0"
                    style={{ x, rotate, opacity, touchAction: 'none' }}
                    drag="x"
                    dragElastic={0.15}
                    onDragEnd={handleDragEnd}
                >
                    <SwipeCard
                        job={current}
                        saved={isJobSaved(current)}
                        onOpen={() => onDetails(current)}
                        onToggleSaved={() => onToggleSaved(current)}
                    />
                </motion.div>
            </div>

            <div className="mt-6 flex items-center justify-center gap-6">
                <button
                    type="button"
                    onClick={() => finish('left')}
                    className="flex h-14 w-14 items-center justify-center rounded-full border border-red-400/30 bg-red-400/10 text-red-300 transition-colors hover:bg-red-400/20"
                    aria-label="Dismiss"
                >
                    <X className="h-6 w-6" />
                </button>
                <button
                    type="button"
                    onClick={() => finish('right')}
                    className="flex h-14 w-14 items-center justify-center rounded-full border border-[#00e5ff]/30 bg-[#00e5ff]/10 text-[#00e5ff] transition-colors hover:bg-[#00e5ff]/20"
                    aria-label="Save"
                >
                    <Heart className="h-6 w-6" />
                </button>
            </div>
        </div>
    );
}

/* -------------------------------------------------------------------------
 *  Detail dialog
 * ---------------------------------------------------------------------- */

function JobDetailDialog({
    open,
    onOpenChange,
    job,
    saved,
    onToggleSaved,
    onOptimizeRole,
    resumeReady,
    matchScore,
    matchScoreLoading,
    aiSummary,
    aiSummaryLoading,
    optimization,
    optimizationLoading,
}) {
    const cleanDescription = useMemo(() => {
        if (!job?.description) return '';
        return DOMPurify.sanitize(job.description);
    }, [job]);

    if (!open || !job) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-6"
            onClick={() => onOpenChange(false)}
        >
            <div
                className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-[2rem] border border-[#333742] bg-[#0b0e14] shadow-2xl sm:rounded-[2rem]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-[#333742] bg-[#0b0e14]/95 p-6 backdrop-blur">
                    <div className="min-w-0 flex-1">
                        <div className="text-[11px] uppercase tracking-wider text-[#94a3b8]">
                            {job.source}
                        </div>
                        <h2 className="mt-2 text-2xl font-semibold text-white">{job.title}</h2>
                        <div className="mt-1 text-sm text-[#94a3b8]">
                            {job.company} {job.location && `• ${job.location}`}
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                            <MatchScorePill score={matchScore} loading={matchScoreLoading} />
                            {job.employment_type && <Badge>{job.employment_type}</Badge>}
                            {job.remote && <Badge className="border-[#00e5ff]/30 text-[#00e5ff]">Remote</Badge>}
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => onOpenChange(false)}
                        className="rounded-full border border-white/10 p-2 text-white/60 hover:bg-white/5"
                        aria-label="Close"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="overflow-y-auto p-6">
                    {aiSummaryLoading && (
                        <div className="mb-5 flex items-center gap-2 text-sm text-[#94a3b8]">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Generating AI summary...
                        </div>
                    )}
                    {aiSummary && (
                        <div className="mb-6 rounded-[1.25rem] border border-[#00e5ff]/20 bg-[#00e5ff]/5 p-5">
                            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#00e5ff]">
                                <Sparkles className="h-3.5 w-3.5" />
                                AI Summary
                            </div>
                            {aiSummary.summary_short && (
                                <div className="text-sm leading-6 text-white/85">
                                    {aiSummary.summary_short}
                                </div>
                            )}
                            {Array.isArray(aiSummary.summary_bullets) && aiSummary.summary_bullets.length > 0 && (
                                <ul className="mt-3 space-y-2">
                                    {aiSummary.summary_bullets.map((bullet, i) => (
                                        <li key={i} className="flex gap-2 text-sm leading-6 text-white/75">
                                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#00e5ff]/60" />
                                            <span>{bullet}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {Array.isArray(aiSummary.attention_tags) && aiSummary.attention_tags.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-1.5">
                                    {aiSummary.attention_tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="inline-flex items-center rounded-full border border-[#00e5ff]/30 bg-[#00e5ff]/10 px-2 py-0.5 text-[10px] font-medium text-[#00e5ff]"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {optimizationLoading && (
                        <div className="mb-5 flex items-center gap-2 text-sm text-[#94a3b8]">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Optimizing your resume for this role...
                        </div>
                    )}
                    {optimization && (
                        <div className="mb-6 rounded-[1.25rem] border border-purple-400/20 bg-purple-400/5 p-5">
                            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-300">
                                <WandSparkles className="h-3.5 w-3.5" />
                                Resume Optimization
                            </div>
                            {typeof optimization === 'string' ? (
                                <div className="text-sm leading-6 text-white/85">{optimization}</div>
                            ) : Array.isArray(optimization.suggestions) ? (
                                <div className="space-y-4">
                                    <div className="text-xs text-white/60">
                                        {optimization.suggestions.length} bullet{optimization.suggestions.length !== 1 ? 's' : ''} rewritten for this role
                                    </div>
                                    {optimization.suggestions.map((s, i) => (
                                        <div
                                            key={i}
                                            className="rounded-[1rem] border border-white/5 bg-black/20 p-4"
                                        >
                                            <div className="mb-3 flex items-center gap-2">
                                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-400/20 text-[10px] font-semibold text-purple-300">
                                                    {i + 1}
                                                </span>
                                            </div>

                                            <div className="space-y-3">
                                                <div>
                                                    <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-white/40">
                                                        Original
                                                    </div>
                                                    <div className="text-sm leading-6 text-white/55 line-through decoration-white/20">
                                                        {s.original}
                                                    </div>
                                                </div>

                                                <div>
                                                    <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-300/80">
                                                        Improved
                                                    </div>
                                                    <div className="text-sm leading-6 text-white/90">
                                                        {s.improved}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(s.improved);
                                                        }}
                                                        className="mt-2 inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-white/60 transition-colors hover:border-emerald-400/30 hover:bg-emerald-400/10 hover:text-emerald-200"
                                                    >
                                                        Copy improved
                                                    </button>
                                                </div>

                                                {s.reason && (
                                                    <div className="rounded-[0.75rem] border border-purple-400/10 bg-purple-400/5 p-3">
                                                        <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-purple-300/80">
                                                            Why
                                                        </div>
                                                        <div className="text-xs leading-5 text-white/70">
                                                            {s.reason}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <pre className="whitespace-pre-wrap text-sm leading-6 text-white/85 font-sans">
                                    {JSON.stringify(optimization, null, 2)}
                                </pre>
                            )}
                        </div>
                    )}

                    <div
                        className="prose prose-invert max-w-none prose-sm prose-headings:text-white prose-p:text-white/80 prose-li:text-white/80"
                        dangerouslySetInnerHTML={{ __html: cleanDescription }}
                    />
                </div>

                <div className="sticky bottom-0 flex flex-wrap items-center justify-end gap-2 border-t border-[#333742] bg-[#0b0e14]/95 p-4 backdrop-blur">
                    <Button
                        variant="outline"
                        onClick={() => onToggleSaved(job)}
                    >
                        {saved ? (
                            <>
                                <BookmarkCheck className="mr-2 h-4 w-4 text-[#00e5ff]" />
                                Saved
                            </>
                        ) : (
                            <>
                                <Bookmark className="mr-2 h-4 w-4" />
                                Save
                            </>
                        )}
                    </Button>
                    <Button
                        variant="outline"
                        disabled={!resumeReady}
                        onClick={() => onOptimizeRole(job)}
                    >
                        <WandSparkles className="mr-2 h-4 w-4" />
                        Optimize for role
                    </Button>
                    {job.url && (
                        <Button
                            onClick={() => window.open(job.url, '_blank', 'noopener,noreferrer')}
                        >
                            Apply
                            <ExternalLink className="ml-2 h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}

/* -------------------------------------------------------------------------
 *  Saved jobs drawer
 * ---------------------------------------------------------------------- */

function SavedJobsDrawer({ isOpen, onClose, savedJobs, onSelectJob, onRemove, onClearAll }) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-40 flex justify-end bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div
                className="flex h-full w-full max-w-md flex-col border-l border-[#333742] bg-[#0b0e14] shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between border-b border-[#333742] p-5">
                    <div>
                        <h3 className="text-lg font-semibold text-white">Saved jobs</h3>
                        <div className="text-xs text-[#94a3b8]">{savedJobs.length} saved</div>
                    </div>
                    <div className="flex items-center gap-2">
                        {savedJobs.length > 0 && (
                            <Button variant="ghost" size="sm" onClick={onClearAll}>
                                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                                Clear all
                            </Button>
                        )}
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-full p-1.5 text-white/60 hover:bg-white/5"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    {savedJobs.length === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center text-center">
                            <Bookmark className="mb-3 h-10 w-10 text-[#94a3b8]/40" />
                            <div className="text-sm text-[#94a3b8]">No saved jobs yet</div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {savedJobs.map((job) => (
                                <div
                                    key={job.id}
                                    className="group flex items-start justify-between gap-3 rounded-[1.25rem] border border-[#333742] bg-white/[0.02] p-4 transition-colors hover:border-[#00e5ff]/30"
                                >
                                    <button
                                        type="button"
                                        onClick={() => onSelectJob(job)}
                                        className="min-w-0 flex-1 text-left"
                                    >
                                        <div className="line-clamp-1 text-sm font-semibold text-white">
                                            {job.title}
                                        </div>
                                        <div className="mt-0.5 line-clamp-1 text-xs text-[#94a3b8]">
                                            {job.company}
                                        </div>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onRemove(job)}
                                        className="shrink-0 rounded-full p-1.5 text-white/40 hover:bg-white/5 hover:text-red-400"
                                        aria-label="Remove"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

/* -------------------------------------------------------------------------
 *  Resume Lab side panel
 * ---------------------------------------------------------------------- */

function ResumeLabPanel({
    resumeFileName,
    matchProfile,
    onUpload,
    onClear,
    onAnalyze,
    isUploading,
    isAnalyzing,
    analysis,
    error,
}) {
    const fileRef = useRef(null);

    return (
        <div className="space-y-4 rounded-[2rem] border border-[#333742] bg-[#14171f]/60 p-5 backdrop-blur">
            <div className="flex items-center gap-2">
                <Compass className="h-4 w-4 text-[#00e5ff]" />
                <h3 className="text-sm font-semibold text-white">Resume Lab</h3>
            </div>

            {!resumeFileName ? (
                <>
                    <p className="text-xs leading-5 text-[#94a3b8]">
                        Upload a resume to unlock per-job match scores, AI summaries, and role optimization.
                    </p>
                    <input
                        ref={fileRef}
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) onUpload(f);
                        }}
                    />
                    <Button
                        variant="outline"
                        disabled={isUploading}
                        onClick={() => fileRef.current?.click()}
                        className="w-full"
                    >
                        {isUploading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            <>
                                <Upload className="mr-2 h-4 w-4" />
                                Upload PDF
                            </>
                        )}
                    </Button>
                </>
            ) : (
                <>
                    <div className="rounded-[1.25rem] border border-[#00e5ff]/20 bg-[#00e5ff]/5 p-3">
                        <div className="flex items-start gap-2">
                            <FileText className="mt-0.5 h-4 w-4 shrink-0 text-[#00e5ff]" />
                            <div className="min-w-0">
                                <div className="truncate text-xs font-semibold text-white">
                                    {resumeFileName}
                                </div>
                                {matchProfile?.skills_extracted && (
                                    <div className="mt-1 text-[11px] text-[#94a3b8]">
                                        {matchProfile.skills?.length || 0} skills detected
                                        {matchProfile.experience_years !== null &&
                                            ` • ${matchProfile.experience_years}y exp`}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={onAnalyze} disabled={isAnalyzing} className="flex-1">
                            {isAnalyzing ? (
                                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                            ) : (
                                <BarChart3 className="mr-1.5 h-3.5 w-3.5" />
                            )}
                            Analyze
                        </Button>
                        <Button variant="ghost" size="sm" onClick={onClear}>
                            Clear
                        </Button>
                    </div>

                    {analysis && (
                        <div className="rounded-[1.25rem] border border-white/10 bg-black/20 p-3 text-xs">
                            {typeof analysis.score === 'number' && (
                                <div className="mb-2">
                                    <div className="text-[10px] uppercase tracking-wider text-[#94a3b8]">Score</div>
                                    <div className="text-2xl font-semibold text-[#00e5ff]">{analysis.score}</div>
                                </div>
                            )}
                            {analysis.headline && (
                                <div className="text-white/80">{analysis.headline}</div>
                            )}
                        </div>
                    )}
                </>
            )}

            {error && (
                <div className="rounded-[1.25rem] border border-red-400/30 bg-red-400/10 p-3 text-xs text-red-200">
                    {error}
                </div>
            )}
        </div>
    );
}

/* -------------------------------------------------------------------------
 *  Main page
 * ---------------------------------------------------------------------- */

function JobsPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const isMobile = useMediaQuery('(max-width: 639px)');

    // Filters (URL-synced)
    const q = searchParams.get('q') || '';
    const location = searchParams.get('location') || '';
    const source = searchParams.get('source') || '';
    const remote = searchParams.get('remote') === 'true';

    const updateParam = (key, value) => {
        const next = new URLSearchParams(searchParams);
        if (value) next.set(key, value);
        else next.delete(key);
        setSearchParams(next, { replace: true });
    };

    // High-contrast toggle
    const [highContrast, setHighContrast] = useState(getInitialContrast);
    useEffect(() => {
        localStorage.setItem(CONTRAST_STORAGE_KEY, String(highContrast));
    }, [highContrast]);

    // Guest user id
    const guestUserId = useMemo(getOrCreateGuestUserId, []);

    // Resume state
    const [resumeFile, setResumeFile] = useState({ fileName: null });
    const [matchProfile, setMatchProfile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [resumeAnalysis, setResumeAnalysis] = useState(null);
    const [resumeError, setResumeError] = useState(null);

    const resumeReady = Boolean(resumeFile.fileName);

    // Saved jobs
    const { savedJobs, isJobSaved, toggleSaved, unsaveJob, clearAll } = useSavedJobs();
    const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState(false);

    // Job detail
    const [selectedJob, setSelectedJob] = useState(null);
    const [detailOpen, setDetailOpen] = useState(false);

    // Per-job AI / match state
    const [matchById, setMatchById] = useState({});
    const [matchLoadingById, setMatchLoadingById] = useState({});
    const [summaryById, setSummaryById] = useState({});
    const [summaryLoadingById, setSummaryLoadingById] = useState({});
    const [optimizationById, setOptimizationById] = useState({});
    const [optimizationLoadingById, setOptimizationLoadingById] = useState({});

    // Swipe index (mobile)
    const [swipeIndex, setSwipeIndex] = useState(0);

    /* ---- main jobs feed (cursor-based infinite scroll) ---- */
    const jobsQuery = useInfiniteQuery({
        queryKey: ['jobs', { q, location, source, remote }],
        queryFn: ({ pageParam = null }) =>
            api.jobs.list({ pageParam, q, location, source, remote }),
        getNextPageParam: (last) => last.next_cursor || null,
        initialPageParam: null,
    });

    const jobs = useMemo(() => {
        const flat = jobsQuery.data?.pages.flatMap((p) => p.items) ?? [];
        return [...flat].sort((a, b) => {
            const aDate = new Date(a.posted_date || a.created_at || 0).getTime();
            const bDate = new Date(b.posted_date || b.created_at || 0).getTime();
            return bDate - aDate;
        });
    }, [jobsQuery.data]);
    /* ---- recommended carousel ---- */
    /* ---- featured carousel: top 8 Business/Data Analytics roles ---- */
    const recommendedQuery = useQuery({
        queryKey: ['featured-analytics'],
        queryFn: async () => {
            // Run two queries in parallel since the backend doesn't support OR on q
            const [dataAnalyst, businessAnalyst] = await Promise.all([
                apiFetch(`/api/v1/jobs?${new URLSearchParams({
                    q: 'data analyst',
                    limit: '12',
                    active_only: 'false',
                    stale_after_days: '30',
                    posted_within_days: '30',
                })}`),
                apiFetch(`/api/v1/jobs?${new URLSearchParams({
                    q: 'business analyst',
                    limit: '12',
                    active_only: 'false',
                    stale_after_days: '30',
                    posted_within_days: '30',
                })}`),
            ]);

            // Merge, dedupe by id, sort by posted_date desc, take top 8
            const merged = [...(dataAnalyst.items || []), ...(businessAnalyst.items || [])];
            const seen = new Set();
            const unique = merged.filter((job) => {
                if (seen.has(job.id)) return false;
                seen.add(job.id);
                return true;
            });
            unique.sort((a, b) => {
                const aDate = new Date(a.posted_date || a.created_at || 0).getTime();
                const bDate = new Date(b.posted_date || b.created_at || 0).getTime();
                return bDate - aDate;
            });

            return { items: unique.slice(0, 8) };
        },
        staleTime: 10 * 60 * 1000, // cache for 10 minutes
    });
    const recommendedJobs = recommendedQuery.data?.items ?? [];

    /* ---- actions ---- */

    const handleUpload = async (file) => {
        setResumeError(null);
        setIsUploading(true);
        try {
            const result = await api.resume.upload(guestUserId, file);
            setResumeFile({ fileName: result.filename || file.name });
            // Pull match profile
            try {
                const profile = await api.resume.matchProfile(guestUserId);
                setMatchProfile(profile);
            } catch {
                // Non-fatal; resume uploaded but no profile
            }
            setMatchById({});
            setOptimizationById({});
            setResumeAnalysis(null);
        } catch (err) {
            setResumeError(err.message || 'Upload failed');
        } finally {
            setIsUploading(false);
        }
    };

    const handleClearResume = () => {
        setResumeFile({ fileName: null });
        setMatchProfile(null);
        setResumeAnalysis(null);
        setMatchById({});
        setOptimizationById({});
        setResumeError(null);
    };

    const handleAnalyze = async () => {
        setResumeError(null);
        setIsAnalyzing(true);
        try {
            const result = await api.resume.analyze(guestUserId, 'balanced');
            setResumeAnalysis(result);
        } catch (err) {
            setResumeError(err.message || 'Analysis failed');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const ensureMatchScore = useCallback(
        async (job) => {
            if (!matchProfile?.skills_extracted) return;
            if (matchById[job.id] || matchLoadingById[job.id]) return;
            setMatchLoadingById((p) => ({ ...p, [job.id]: true }));
            try {
                const score = await api.jobs.matchScore(
                    job.id,
                    matchProfile.skills,
                    matchProfile.experience_years,
                );
                setMatchById((p) => ({ ...p, [job.id]: score }));
            } catch {
                // Non-fatal
            } finally {
                setMatchLoadingById((p) => ({ ...p, [job.id]: false }));
            }
        },
        [matchProfile, matchById, matchLoadingById],
    );

    // Score visible jobs lazily
    useEffect(() => {
        if (!matchProfile?.skills_extracted) return;
        jobs.slice(0, 24).forEach((job) => {
            void ensureMatchScore(job);
        });
    }, [jobs, matchProfile, ensureMatchScore]);

    const handleDetails = async (job) => {
        setSelectedJob(job);
        setDetailOpen(true);
        void ensureMatchScore(job);
        if (!summaryById[job.id] && !summaryLoadingById[job.id]) {
            setSummaryLoadingById((p) => ({ ...p, [job.id]: true }));
            try {
                const s = await api.jobs.summary(job.id);
                setSummaryById((p) => ({ ...p, [job.id]: s }));
            } catch {
                // ignore
            } finally {
                setSummaryLoadingById((p) => ({ ...p, [job.id]: false }));
            }
        }
    };

    const handleOptimize = async (job) => {
        if (!resumeReady) return;
        setOptimizationLoadingById((p) => ({ ...p, [job.id]: true }));
        try {
            const r = await api.resume.optimize(job.id, guestUserId, 'bullets');
            setOptimizationById((p) => ({ ...p, [job.id]: r }));
            if (!detailOpen || selectedJob?.id !== job.id) {
                setSelectedJob(job);
                setDetailOpen(true);
            }
        } catch (err) {
            setResumeError(err.message || 'Optimization failed');
        } finally {
            setOptimizationLoadingById((p) => ({ ...p, [job.id]: false }));
        }
    };

    /* ---- render ---- */

    return (
        <div
            className={cn(
                'min-h-screen text-white',
                highContrast ? 'bg-black' : 'bg-[#0a0d14]',
            )}
        >
            {/* Header */}
            <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-[#0a0d14]/85 backdrop-blur-xl">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 lg:px-8">
                    <div className="flex items-center gap-3">
                        <Briefcase className="h-5 w-5 text-[#00e5ff]" />
                        <span className="text-sm font-semibold">Job Board</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setHighContrast((v) => !v)}
                            title="Toggle high contrast"
                        >
                            {highContrast ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setIsSavedDrawerOpen(true)}>
                            <Bookmark className="mr-1.5 h-3.5 w-3.5" />
                            Saved
                            {savedJobs.length > 0 && (
                                <span className="ml-1.5 rounded-full bg-[#00e5ff]/20 px-1.5 text-[10px] text-[#00e5ff]">
                                    {savedJobs.length}
                                </span>
                            )}
                        </Button>
                    </div>
                </div>
            </header>

            <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
                {/* Hero */}
                <section className="mb-8 rounded-[2rem] border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.01] p-6 backdrop-blur sm:p-8">
                    <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
                        <div>
                            <div className="text-[11px] uppercase tracking-[0.24em] text-white/45">
                                Live feed
                            </div>
                            <h1 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">
                                Find your next role
                            </h1>
                            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/60">
                                Aggregated across {JOB_SOURCES.length}+ sources. Upload a resume to
                                unlock match scores and role-tailored suggestions.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 sm:min-w-[340px]">
                            <div className="rounded-[1.25rem] border border-white/10 bg-black/20 p-4">
                                <div className="text-[10px] uppercase tracking-[0.22em] text-white/45">
                                    Live roles
                                </div>
                                <div className="mt-2 text-2xl font-semibold">{jobs.length}</div>
                            </div>
                            <div className="rounded-[1.25rem] border border-white/10 bg-black/20 p-4">
                                <div className="text-[10px] uppercase tracking-[0.22em] text-white/45">
                                    Recommended
                                </div>
                                <div className="mt-2 text-2xl font-semibold">{recommendedJobs.length}</div>
                            </div>
                            <div className="rounded-[1.25rem] border border-white/10 bg-black/20 p-4">
                                <div className="text-[10px] uppercase tracking-[0.22em] text-white/45">
                                    Resume
                                </div>
                                <div className="mt-2 text-sm font-semibold">
                                    {resumeReady ? 'Connected' : 'Not uploaded'}
                                </div>
                            </div>
                            <div className="rounded-[1.25rem] border border-white/10 bg-black/20 p-4">
                                <div className="text-[10px] uppercase tracking-[0.22em] text-white/45">
                                    Saved
                                </div>
                                <div className="mt-2 text-2xl font-semibold">{savedJobs.length}</div>
                            </div>
                        </div>
                    </div>

                    {/* Filter bar */}
                    <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="relative">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                            <input
                                type="text"
                                placeholder="Title or keyword"
                                value={q}
                                onChange={(e) => updateParam('q', e.target.value)}
                                className="w-full rounded-full border border-[#333742] bg-white/[0.03] py-2.5 pl-10 pr-4 text-sm text-white placeholder-white/40 focus:border-[#00e5ff]/40 focus:outline-none"
                            />
                        </div>
                        <div className="relative">
                            <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                            <input
                                type="text"
                                placeholder="Location"
                                value={location}
                                onChange={(e) => updateParam('location', e.target.value)}
                                className="w-full rounded-full border border-[#333742] bg-white/[0.03] py-2.5 pl-10 pr-4 text-sm text-white placeholder-white/40 focus:border-[#00e5ff]/40 focus:outline-none"
                            />
                        </div>
                        <select
                            value={source}
                            onChange={(e) => updateParam('source', e.target.value)}
                            className="rounded-full border border-[#333742] bg-[#14171f] px-4 py-2.5 text-sm text-white focus:border-[#00e5ff]/40 focus:outline-none"
                        >
                            <option value="" style={{ backgroundColor: '#14171f', color: 'white' }}>All sources</option>
                            {JOB_SOURCES.map((s) => (
                                <option key={s.value} value={s.value} style={{ backgroundColor: '#14171f', color: 'white' }}>
                                    {s.label}
                                </option>
                            ))}
                        </select>
                        <label className="flex items-center gap-3 rounded-full border border-[#333742] bg-white/[0.03] px-4 py-2.5 text-sm text-white cursor-pointer">
                            <input
                                type="checkbox"
                                checked={remote}
                                onChange={(e) => updateParam('remote', e.target.checked ? 'true' : '')}
                                className="accent-[#00e5ff]"
                            />
                            Remote only
                        </label>
                    </div>
                </section>

                {/* Recommended carousel */}
                {(recommendedJobs.length > 0 || recommendedQuery.isLoading) && (
                    <section className="mb-8 space-y-3">
                        <div className="flex items-end justify-between gap-4 px-1">
                            <div>
                                <div className="text-[11px] uppercase tracking-[0.24em] text-white/45">
                                    Featured stream
                                </div>
                                <h2 className="mt-2 text-2xl font-semibold">Roles worth opening first</h2>
                            </div>
                        </div>
                        <RecommendedCarousel
                            jobs={recommendedJobs}
                            isLoading={recommendedQuery.isLoading}
                            onJobClick={handleDetails}
                            isJobSaved={isJobSaved}
                            onToggleSaved={toggleSaved}
                        />
                    </section>
                )}

                {/* Error state */}
                {jobsQuery.isError && (
                    <div className="mb-6 rounded-[1.5rem] border border-red-400/30 bg-red-400/10 p-5">
                        <div className="font-semibold text-red-200">Failed to load jobs</div>
                        <div className="mt-1 text-sm text-red-200/80">
                            {jobsQuery.error?.message || 'Unknown error'}
                        </div>
                        <Button variant="outline" size="sm" onClick={() => jobsQuery.refetch()} className="mt-3">
                            Retry
                        </Button>
                    </div>
                )}

                {/* Main feed: grid on desktop, swipe on mobile */}
                <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
                    <main>
                        {isMobile ? (
                            <JobCardStack
                                jobs={jobs}
                                index={swipeIndex}
                                onAdvance={() => setSwipeIndex((v) => v + 1)}
                                onSave={toggleSaved}
                                onToggleSaved={toggleSaved}
                                onDismiss={() => { /* no-op */ }}
                                onDetails={handleDetails}
                                isJobSaved={isJobSaved}
                                isFetchingNextPage={jobsQuery.isFetchingNextPage || jobsQuery.isLoading}
                            />
                        ) : jobsQuery.isLoading ? (
                            <div className="flex h-64 items-center justify-center">
                                <Loader2 className="h-8 w-8 animate-spin text-[#94a3b8]" />
                            </div>
                        ) : jobs.length === 0 ? (
                            <div className="flex h-64 flex-col items-center justify-center rounded-[2rem] border border-[#333742] bg-[#14171f]/50">
                                <Briefcase className="mb-4 h-12 w-12 text-[#94a3b8]/50" />
                                <h3 className="text-xl font-semibold">No jobs found</h3>
                                <p className="mt-2 text-[#94a3b8]">Adjust your filters to see more.</p>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                                    <AnimatePresence>
                                        {jobs.map((job) => (
                                            <JobCard
                                                key={job.id}
                                                job={job}
                                                saved={isJobSaved(job)}
                                                onToggleSaved={toggleSaved}
                                                onOptimizeRole={handleOptimize}
                                                resumeReady={resumeReady}
                                                onClick={handleDetails}
                                                matchScore={matchById[job.id]}
                                                matchScoreLoading={matchLoadingById[job.id]}
                                            />
                                        ))}
                                    </AnimatePresence>
                                </div>

                                {jobsQuery.hasNextPage && (
                                    <div className="mt-8 flex justify-center">
                                        <Button
                                            size="lg"
                                            variant="outline"
                                            onClick={() => jobsQuery.fetchNextPage()}
                                            disabled={jobsQuery.isFetchingNextPage}
                                        >
                                            {jobsQuery.isFetchingNextPage ? (
                                                <>
                                                    <Loader2 className="mr-2 h-5 w-5 animate-spin text-[#00e5ff]" />
                                                    Loading...
                                                </>
                                            ) : (
                                                <>
                                                    <ChevronDown className="mr-2 h-5 w-5" />
                                                    Load more
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </main>

                    <aside className="hidden xl:block xl:sticky xl:top-24 xl:h-fit">
                        <ResumeLabPanel
                            resumeFileName={resumeFile.fileName}
                            matchProfile={matchProfile}
                            onUpload={handleUpload}
                            onClear={handleClearResume}
                            onAnalyze={handleAnalyze}
                            isUploading={isUploading}
                            isAnalyzing={isAnalyzing}
                            analysis={resumeAnalysis}
                            error={resumeError}
                        />
                    </aside>
                </div>
            </div>

            <JobDetailDialog
                open={detailOpen}
                onOpenChange={setDetailOpen}
                job={selectedJob}
                saved={selectedJob ? isJobSaved(selectedJob) : false}
                onToggleSaved={toggleSaved}
                onOptimizeRole={handleOptimize}
                resumeReady={resumeReady}
                matchScore={selectedJob ? matchById[selectedJob.id] : null}
                matchScoreLoading={selectedJob ? matchLoadingById[selectedJob.id] : false}
                aiSummary={selectedJob ? summaryById[selectedJob.id] : null}
                aiSummaryLoading={selectedJob ? summaryLoadingById[selectedJob.id] : false}
                optimization={selectedJob ? optimizationById[selectedJob.id] : null}
                optimizationLoading={selectedJob ? optimizationLoadingById[selectedJob.id] : false}
            />

            <SavedJobsDrawer
                isOpen={isSavedDrawerOpen}
                onClose={() => setIsSavedDrawerOpen(false)}
                savedJobs={savedJobs}
                onSelectJob={(job) => {
                    setIsSavedDrawerOpen(false);
                    handleDetails(job);
                }}
                onRemove={unsaveJob}
                onClearAll={clearAll}
            />
        </div>
    );
}

/* -------------------------------------------------------------------------
 *  Exported wrapper with QueryClient
 * ---------------------------------------------------------------------- */

const queryClient = new QueryClient({
    defaultOptions: {
        queries: { staleTime: Infinity, refetchOnWindowFocus: false, retry: 1 },
    },
});

export default function JobBoard() {
    return (
        <QueryClientProvider client={queryClient}>
            <JobsPage />
        </QueryClientProvider>
    );
}