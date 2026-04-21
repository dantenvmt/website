// src/components/home/HowItWorks.js
//
// "How it works" section with scroll-synced animation.
// As the user scrolls, the active step highlights and the visual preview on
// the right animates to match.
//
// Drop into src/components/home/ and import into HomePage.js:
//   import HowItWorks from '../components/home/HowItWorks';

import React, { useState, useEffect, useRef } from 'react';
import {
    UserPlus,
    FileSearch,
    Sparkles,
    Send,
    Check,
    MapPin,
    DollarSign,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Step visuals — each is a miniature UI preview, not a static image  */
/* ------------------------------------------------------------------ */

function StepVisual1() {
    // Profile creation — floating form card
    return (
        <div className="relative h-full w-full">
            <div
                className="absolute left-1/2 top-1/2 w-[86%] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-[1.5rem] border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-6 shadow-2xl backdrop-blur-md"
                style={{ animation: 'floaty 3s ease-in-out infinite' }}
            >
                <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#06b6d4] to-[#0891b2] text-lg font-bold text-white">
                        T
                    </div>
                    <div>
                        <div className="h-3 w-28 rounded bg-white/20" />
                        <div className="mt-1.5 h-2 w-20 rounded bg-white/10" />
                    </div>
                </div>
                <div className="space-y-2.5">
                    <div className="h-8 rounded-lg border border-white/10 bg-white/5" />
                    <div className="h-8 rounded-lg border border-white/10 bg-white/5" />
                    <div className="h-8 rounded-lg border border-[#06b6d4]/30 bg-[#06b6d4]/10" />
                </div>
                <div className="mt-4 h-10 rounded-full bg-[#06b6d4] flex items-center justify-center">
                    <Check className="h-4 w-4 text-white" />
                </div>
            </div>
        </div>
    );
}

function StepVisual2() {
    // Resume upload — page with extracted skill chips popping in
    const skills = ['Python', 'SQL', 'Tableau', 'Pandas', 'ML', 'Airflow'];
    return (
        <div className="relative h-full w-full">
            <div
                className="absolute left-1/2 top-1/2 w-[86%] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-[1.5rem] border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-6 shadow-2xl backdrop-blur-md"
                style={{ animation: 'floaty 3s ease-in-out infinite' }}
            >
                <div className="flex items-center gap-3 rounded-xl border border-[#06b6d4]/20 bg-[#06b6d4]/5 p-3">
                    <FileSearch className="h-5 w-5 shrink-0 text-[#06b6d4]" />
                    <div className="min-w-0 flex-1">
                        <div className="h-3 w-32 rounded bg-white/30" />
                        <div className="mt-1.5 h-2 w-20 rounded bg-white/10" />
                    </div>
                    <Check className="h-4 w-4 text-[#06b6d4]" />
                </div>

                <div className="mt-5 text-[10px] font-semibold uppercase tracking-wider text-white/40">
                    Extracted
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                    {skills.map((s, i) => (
                        <span
                            key={s}
                            className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/80"
                            style={{
                                animation: `popIn 0.4s ease-out ${0.1 * i}s both`,
                            }}
                        >
                            {s}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}

function StepVisual3() {
    // Job cards stacked with match scores
    const cards = [
        { title: 'Data Analyst', company: 'Stripe', score: 92, color: 'emerald' },
        { title: 'ML Engineer', company: 'Snowflake', score: 74, color: 'amber' },
        { title: 'BI Engineer', company: 'Databricks', score: 58, color: 'amber' },
    ];
    const colorMap = {
        emerald: 'bg-emerald-400/15 border-emerald-400/30 text-emerald-300',
        amber: 'bg-amber-400/15 border-amber-400/30 text-amber-300',
    };
    return (
        <div className="relative h-full w-full">
            <div className="absolute left-1/2 top-1/2 w-[86%] max-w-md -translate-x-1/2 -translate-y-1/2 space-y-3">
                {cards.map((c, i) => (
                    <div
                        key={c.title}
                        className="rounded-[1.25rem] border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-4 shadow-xl backdrop-blur-md"
                        style={{
                            animation: `slideRight 0.5s ease-out ${0.15 * i}s both`,
                        }}
                    >
                        <div className="flex items-start justify-between">
                            <div className="min-w-0 flex-1">
                                <div className="text-xs text-white/40">{c.company}</div>
                                <div className="mt-1 text-sm font-semibold text-white">{c.title}</div>
                            </div>
                            <span
                                className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold tabular-nums ${colorMap[c.color]}`}
                            >
                                <Sparkles className="mr-1 inline h-2.5 w-2.5" />
                                {c.score}%
                            </span>
                        </div>
                        <div className="mt-2.5 flex items-center gap-3 text-[10px] text-white/40">
                            <span className="inline-flex items-center gap-1">
                                <MapPin className="h-2.5 w-2.5" />
                                Remote
                            </span>
                            <span className="inline-flex items-center gap-1">
                                <DollarSign className="h-2.5 w-2.5" />
                                $140k
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function StepVisual4() {
    // Bullet rewrite — before/after with glow
    return (
        <div className="relative h-full w-full">
            <div
                className="absolute left-1/2 top-1/2 w-[86%] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-[1.5rem] border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-5 shadow-2xl backdrop-blur-md"
                style={{ animation: 'floaty 3s ease-in-out infinite' }}
            >
                <div className="rounded-xl border border-white/5 bg-black/20 p-3">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
                        Original
                    </div>
                    <div className="mt-1.5 text-xs leading-5 text-white/50 line-through decoration-white/20">
                        Built dashboards for business reporting.
                    </div>
                </div>

                <div className="my-3 flex items-center justify-center">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#06b6d4]/10 text-[#06b6d4]">
                        <Sparkles className="h-3.5 w-3.5" />
                    </div>
                </div>

                <div
                    className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-3"
                    style={{ animation: 'glow 2s ease-in-out infinite' }}
                >
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-emerald-300/80">
                        Improved
                    </div>
                    <div className="mt-1.5 text-xs leading-5 text-white/90">
                        Engineered <span className="text-emerald-300">self-service dashboards</span> that
                        reduced ad-hoc reporting volume by <span className="text-emerald-300">43%</span>.
                    </div>
                </div>

                <div className="mt-4 h-9 rounded-full bg-[#06b6d4] flex items-center justify-center gap-1.5 text-xs font-semibold text-white">
                    <Check className="h-3.5 w-3.5" />
                    Applied to resume
                </div>
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Step definitions                                                   */
/* ------------------------------------------------------------------ */

const STEPS = [
    {
        num: '01',
        icon: UserPlus,
        title: 'Create your profile',
        body: 'Sign up in under a minute. Your profile becomes the foundation for everything — resume optimization, job matching, application tracking.',
        Visual: StepVisual1,
    },
    {
        num: '02',
        icon: FileSearch,
        title: 'Upload your resume',
        body: 'We extract your skills, experience, and domain expertise automatically. No manual tagging. Your strengths surface where they matter.',
        Visual: StepVisual2,
    },
    {
        num: '03',
        icon: Sparkles,
        title: 'Browse with AI match scores',
        body: 'Every job is scored against your profile in real time. See exactly why a role fits, where your gaps are, what to emphasize.',
        Visual: StepVisual3,
    },
    {
        num: '04',
        icon: Send,
        title: 'Apply with confidence',
        body: 'One-click bullet rewrites tailor your resume for each role. Copy the improved version, paste it into your resume, send.',
        Visual: StepVisual4,
    },
];

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export default function HowItWorks() {
    const [activeStep, setActiveStep] = useState(0);
    const stepRefs = useRef([]);

    useEffect(() => {
        // Fire when a step scrolls into the middle of the viewport
        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((e) => e.isIntersecting)
                    .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

                if (visible.length) {
                    const idx = Number(visible[0].target.dataset.stepIndex);
                    setActiveStep(idx);
                }
            },
            {
                rootMargin: '-40% 0px -40% 0px',
                threshold: [0, 0.5, 1],
            },
        );

        stepRefs.current.forEach((el) => el && observer.observe(el));
        return () => observer.disconnect();
    }, []);

    return (
        <section className="relative bg-[#0a0d14] py-20 sm:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Section header */}
                <div className="mx-auto max-w-2xl text-center">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#06b6d4]">
                        How it works
                    </div>
                    <h2 className="mt-4 text-4xl font-semibold leading-tight text-white sm:text-5xl">
                        From resume upload to your next role,{' '}
                        <span className="text-[#06b6d4]">in four steps</span>
                    </h2>
                    <p className="mt-5 text-base leading-7 text-neutral-400">
                        Scroll through the flow — each step shows exactly what happens.
                    </p>
                </div>

                {/* Desktop: two-column sticky layout */}
                <div className="mt-16 hidden lg:grid lg:grid-cols-[1fr_1fr] lg:gap-16">
                    {/* LEFT — scrolling step list */}
                    <div>
                        {STEPS.map((step, i) => {
                            const Icon = step.icon;
                            const isActive = activeStep === i;

                            return (
                                <div
                                    key={step.num}
                                    ref={(el) => (stepRefs.current[i] = el)}
                                    data-step-index={i}
                                    className="flex min-h-[60vh] items-center py-8"
                                >
                                    <div className="w-full transition-all duration-500">
                                        <div className="flex items-center gap-4">
                                            <div
                                                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border transition-all duration-500 ${isActive
                                                    ? 'border-[#06b6d4] bg-[#06b6d4]/15 text-[#06b6d4] scale-110'
                                                    : 'border-white/10 bg-white/[0.03] text-white/40 scale-100'
                                                    }`}
                                            >
                                                <Icon className="h-6 w-6" strokeWidth={1.8} />
                                            </div>
                                            <div
                                                className={`font-mono text-sm transition-colors duration-500 ${isActive ? 'text-[#06b6d4]' : 'text-white/30'
                                                    }`}
                                            >
                                                {step.num}
                                            </div>
                                        </div>

                                        <h3
                                            className={`mt-6 text-3xl font-semibold transition-colors duration-500 ${isActive ? 'text-white' : 'text-white/40'
                                                }`}
                                        >
                                            {step.title}
                                        </h3>
                                        <p
                                            className={`mt-4 max-w-md text-base leading-7 transition-colors duration-500 ${isActive ? 'text-neutral-300' : 'text-neutral-500'
                                                }`}
                                        >
                                            {step.body}
                                        </p>

                                        {/* progress bar */}
                                        <div className="mt-6 h-0.5 w-24 overflow-hidden rounded-full bg-white/5">
                                            <div
                                                className={`h-full bg-[#06b6d4] transition-all duration-700 ${isActive ? 'w-full' : 'w-0'
                                                    }`}
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* RIGHT — sticky visual that swaps per step */}
                    <div className="relative">
                        <div className="sticky top-24 h-[70vh]">
                            <div className="relative h-full overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-b from-white/[0.02] to-transparent">
                                {/* ambient glow */}
                                <div
                                    aria-hidden="true"
                                    className="pointer-events-none absolute inset-0"
                                    style={{
                                        background:
                                            'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(6,182,212,0.10), transparent 70%)',
                                    }}
                                />

                                {/* Cross-fade between visuals */}
                                {STEPS.map((step, i) => {
                                    const Visual = step.Visual;
                                    return (
                                        <div
                                            key={step.num}
                                            className={`absolute inset-0 transition-opacity duration-500 ${activeStep === i ? 'opacity-100' : 'opacity-0 pointer-events-none'
                                                }`}
                                        >
                                            <Visual />
                                        </div>
                                    );
                                })}

                                {/* step indicator dots */}
                                <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2">
                                    {STEPS.map((_, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => {
                                                stepRefs.current[i]?.scrollIntoView({
                                                    behavior: 'smooth',
                                                    block: 'center',
                                                });
                                            }}
                                            className={`h-1.5 rounded-full transition-all duration-300 ${activeStep === i ? 'w-8 bg-[#06b6d4]' : 'w-1.5 bg-white/20'
                                                }`}
                                            aria-label={`Go to step ${i + 1}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile: stacked cards (no sticky — awkward on phones) */}
                <div className="mt-14 space-y-6 lg:hidden">
                    {STEPS.map((step) => {
                        const Icon = step.icon;
                        const Visual = step.Visual;
                        return (
                            <div
                                key={step.num}
                                className="rounded-[1.75rem] border border-white/10 bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-6"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#06b6d4]/20 bg-[#06b6d4]/10 text-[#06b6d4]">
                                        <Icon className="h-5 w-5" strokeWidth={1.8} />
                                    </div>
                                    <span className="font-mono text-xs text-white/30">
                                        {step.num}
                                    </span>
                                </div>
                                <h3 className="mt-5 text-xl font-semibold text-white">
                                    {step.title}
                                </h3>
                                <p className="mt-3 text-sm leading-6 text-neutral-400">
                                    {step.body}
                                </p>
                                <div className="relative mt-6 h-56 overflow-hidden rounded-2xl border border-white/10 bg-black/20">
                                    <Visual />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* CTAs */}
                <div className="mt-20 flex flex-col items-center justify-center gap-4 sm:flex-row">
                    <a
                        href="/job_board"
                        className="inline-flex items-center gap-2 rounded-full bg-[#06b6d4] px-6 py-3 text-sm font-bold text-white transition-all hover:-translate-y-1 hover:bg-[#0891b2] hover:shadow-[0_10px_20px_-10px_rgba(6,182,212,0.6)]"
                    >
                        Browse jobs
                        <Send className="h-4 w-4" />
                    </a>
                    <a
                        href="/resume"
                        className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-6 py-3 text-sm font-medium text-white transition-all hover:border-white/25 hover:bg-white/[0.08]"
                    >
                        Build a resume
                    </a>
                </div>
            </div>

            {/* Inline keyframes — scoped to this section */}
            <style>{`
                @keyframes floaty {
                    0%, 100% { transform: translate(-50%, -50%); }
                    50%      { transform: translate(-50%, calc(-50% - 8px)); }
                }
                @keyframes popIn {
                    from { opacity: 0; transform: scale(0.8) translateY(6px); }
                    to   { opacity: 1; transform: scale(1) translateY(0); }
                }
                @keyframes slideRight {
                    from { opacity: 0; transform: translateX(-24px); }
                    to   { opacity: 1; transform: translateX(0); }
                }
                @keyframes glow {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(16,185,129,0); }
                    50%      { box-shadow: 0 0 24px 0 rgba(16,185,129,0.15); }
                }
            `}</style>
        </section>
    );
}