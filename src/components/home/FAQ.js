// src/components/home/FAQ.js
//
// FAQ section for the Renaisons homepage.
// Drop into src/components/home/ and import into HomePage.js:
//
//   import FAQ from '../components/home/FAQ';
//   ...
//   <FAQ />

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQS = [
    {
        q: 'What is Renaisons?',
        a: 'Renaisons is a career platform that combines a live multi-source job board with AI-powered resume tools. We aggregate roles from over a dozen sources, score each one against your resume in real time, and help you tailor your application before you hit apply.',
    },
    {
        q: 'Where do the jobs come from?',
        a: 'We pull from Adzuna, Greenhouse, Lever, RemoteOK, Remotive, We Work Remotely, Built In, Findwork, Hacker News Jobs, USAJobs, and more. New roles are ingested daily, so the board stays fresh without you refreshing a dozen company career pages.',
    },
    {
        q: 'How does the match score work?',
        a: 'Once you upload a resume, we extract your skills and years of experience. Every job is then scored on a mix of signals: skill overlap, experience fit, recency, work mode preference, and industry alignment. The result is a percentage and a breakdown — not a black box.',
    },
    {
        q: 'Is my resume data private?',
        a: 'Yes. Your resume is stored against your account only and is used to power your match scoring, optimization, and analysis features. It is not shared with employers, sold, or used to train models.',
    },
    {
        q: 'What does the resume optimizer actually do?',
        a: 'For any job you open, you can run "Optimize for role." The AI rewrites your existing bullet points to emphasize the skills and outcomes most relevant to that job description. You see the original, the rewrite, and a short explanation of why each change was made.',
    },
    {
        q: 'Do I need to pay to use it?',
        a: 'No. Browsing jobs, uploading a resume, running match scoring, and generating AI summaries are all free. We may introduce premium features in the future — advanced analytics, application tracking, higher limits — but the core experience stays free.',
    },
    {
        q: 'Does the site work on mobile?',
        a: 'Yes. The job board uses a swipe-card interface on small screens, so you can triage roles the same way you would on a dating app — swipe right to save, left to dismiss. Desktop gives you the full grid and filter experience.',
    },
    {
        q: 'How do I get in touch?',
        a: (
            <>
                Email us at{' '}
                <a
                    href="mailto:info@renaisons.com"
                    className="text-[#06b6d4] hover:underline"
                >
                    info@renaisons.com
                </a>
                . We read every message and usually reply within one business day.
            </>
        ),
    },
];

function FAQItem({ q, a, isOpen, onToggle }) {
    return (
        <div
            className={`rounded-2xl border transition-colors ${isOpen
                ? 'border-[#06b6d4]/25 bg-white/[0.04]'
                : 'border-white/[0.08] bg-white/[0.015] hover:border-white/15'
                }`}
        >
            <button
                type="button"
                onClick={onToggle}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6 sm:py-5"
                aria-expanded={isOpen}
            >
                <span
                    className={`text-base font-medium sm:text-lg ${isOpen ? 'text-white' : 'text-white/90'
                        }`}
                >
                    {q}
                </span>
                <ChevronDown
                    className={`h-5 w-5 shrink-0 transition-transform ${isOpen ? 'rotate-180 text-[#06b6d4]' : 'text-neutral-500'
                        }`}
                />
            </button>

            <div
                className={`grid transition-all duration-300 ease-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                    }`}
            >
                <div className="overflow-hidden">
                    <div className="px-5 pb-5 text-sm leading-7 text-neutral-400 sm:px-6 sm:pb-6">
                        {a}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState(0); // first open by default

    return (
        <section className="bg-[#0a0d14] py-20 sm:py-28">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#06b6d4]">
                        FAQ
                    </div>
                    <h2 className="mt-4 text-4xl font-semibold leading-tight text-white sm:text-5xl">
                        Questions, answered
                    </h2>
                    <p className="mt-5 text-base leading-7 text-neutral-400">
                        Can't find what you're looking for? Reach out at{' '}
                        <a
                            href="mailto:info@renaisons.com"
                            className="text-[#06b6d4] hover:underline"
                        >
                            info@renaisons.com
                        </a>
                        .
                    </p>
                </div>

                <div className="mt-14 space-y-3">
                    {FAQS.map((faq, i) => (
                        <FAQItem
                            key={i}
                            q={faq.q}
                            a={faq.a}
                            isOpen={openIndex === i}
                            onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}