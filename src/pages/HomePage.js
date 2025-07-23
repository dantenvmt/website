import React from 'react';
import { mockNews, mockStories, latestResearch } from '../data/mockData';
import Footer from '../components/layout/Footer';

const HomePage = ({ setPage, setActiveSubPage }) => {
    return (
        <>
            <div className="max-w-7xl mx-auto p-8 md:p-12">
                <section className="py-20 px-4 sm:px-6 flex flex-col items-center text-center">
                    <h2 className="text-3xl font-bold mb-8">What can I help with?</h2>
                    <div className="w-full max-w-3xl relative ">
                        <input
                            type="text"
                            className="w-full bg-neutral-800 text-white rounded-3xl px-6 py-6 pr-16 text-lg placeholder-gray-500 focus:outline-none"
                        />
                        <button className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-gray-300 hover:bg-gray-400 text-white p-3 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-black" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 6.414V17a1 1 0 11-2 0V6.414L3.707 10.707a1 1 0 01-1.414-1.414l6-6z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </section>
                <div className="bg-neutral-900 border border-neutral-800 rounded-md p-3 flex items-center justify-between gap-4 mb-8">

                    <div className="flex items-center gap-4">
                        <span className="bg-white text-black text-xs font-bold uppercase px-2 py-1 rounded">New</span>
                        <p className="text-sm text-neutral-300 hidden md:block">
                            Updates to ChatGPT business plans including connectors to internal tools, enhanced security controls, and flexible pricing.
                        </p>
                        <p className="text-sm text-neutral-300 md:hidden">
                            Updates to ChatGPT business plans.
                        </p>
                    </div>
                    <button
                        onClick={() => setPage('plans')}
                        className="text-white text-sm font-semibold whitespace-nowrap hover:underline"
                    >
                        See plans
                    </button>
                </div>
                <div className="lg:grid lg:grid-cols-3 gap-8 mb-24">
                    <div className="lg:sticky lg:top-24 h-fit lg:col-span-2">
                        <div className="aspect-video rounded-md overflow-hidden">
                            <img src="https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800" alt="Abstract blue art" className="w-full h-full object-cover" />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold mt-4">Introducing ChatGPT agent</h2>
                        <p className="text-neutral-400 mt-2">Product · 15 min read</p>
                    </div>
                    <div className="lg:col-span-1 flex flex-col gap-8 mt-8 lg:mt-0">
                        <div>
                            <div className="aspect-[4/3] rounded-md overflow-hidden">
                                <img src="https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800" alt="Portrait" className="w-full h-full object-cover" />
                            </div>
                            <h3 className="font-semibold mt-3">A letter from Sam & Jerry</h3>
                            <p className="text-sm text-neutral-400">Company · 10 min read</p>
                        </div>
                        <div>
                            <div className="aspect-[4/3] rounded-md overflow-hidden">
                                <img src="https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800" alt="Abstract gradient" className="w-full h-full object-cover" />
                            </div>
                            <h3 className="font-semibold mt-3">Codex</h3>
                            <p className="text-sm text-neutral-400">Product · 5 min read</p>
                        </div>
                        <div>
                            <div className="aspect-[4/3] rounded-md overflow-hidden">
                                <img src="https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800" alt="Abstract gradient" className="w-full h-full object-cover" />
                            </div>
                            <h3 className="font-semibold mt-3">Codex</h3>
                            <p className="text-sm text-neutral-400">Product · 5 min read</p>
                        </div>
                        <div>
                            <div className="aspect-[4/3] rounded-md overflow-hidden">
                                <img src="https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800" alt="Abstract gradient" className="w-full h-full object-cover" />
                            </div>
                            <h3 className="font-semibold mt-3">Codex</h3>
                            <p className="text-sm text-neutral-400">Product · 5 min read</p>
                        </div>
                    </div>
                </div>

                {/* Latest News Section */}
                <div className="mt-24">
                    <h2 className="text-2xl font-bold mb-6">Latest news</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
                        {mockNews.map(item => (
                            <div key={item.title} className="flex items-center gap-6">
                                <div className="w-32 h-32 rounded-md flex-shrink-0 overflow-hidden">
                                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">{item.title}</h3>
                                    <p className="text-neutral-400 text-sm mt-1">{item.category} · {item.date}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Stories Section */}
                <div className="mt-24">
                    <h2 className="text-2xl font-bold mb-6">Stories</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {mockStories.map(item => (
                            <div key={item.title}>
                                <div className="aspect-video rounded-md mb-3 overflow-hidden">
                                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                                </div>
                                <h3 className="font-semibold">{item.title}</h3>
                                <p className="text-sm text-neutral-400">{item.category} · {item.date}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Latest Research Section - Now uses images from mockData */}
                <div className="mt-24">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold">Latest research</h2>
                        <a href="#" className="text-sm font-semibold hover:underline">View all</a>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {latestResearch.map((item) => (
                            <div key={item.title}>
                                <div className="rounded-md aspect-video overflow-hidden">
                                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                                </div>
                                <h3 className="font-semibold mt-3 text-lg">{item.title}</h3>
                                <p className="text-sm text-neutral-400">{item.category} · {item.date}</p>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
            <Footer setPage={setPage} setActiveSubPage={setActiveSubPage} />
        </>
    );
};

export default HomePage;