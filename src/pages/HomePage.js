import React from 'react';
// Import the updated latestResearch data
import { mockNews, mockStories, latestResearch } from '../data/mockData';
import Footer from '../components/layout/Footer';

const HomePage = () => {
    return (
        <>
            <div className="max-w-7xl mx-auto p-8 md:p-12">
                {/* Updates Bar and Top Section */}
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
                        onClick={() => alert('See Plans clicked!')}
                        className="text-white text-sm font-semibold whitespace-nowrap hover:underline"
                    >
                        See plans
                    </button>
                </div>
                <div className="lg:grid lg:grid-cols-3 gap-8 mb-24">
                    <div className="lg:sticky lg:top-24 h-fit lg:col-span-2">
                        <div className="aspect-video rounded-md overflow-hidden">
                            <img src="https://images.unsplash.com/photo-1599389929943-524392a86a64?q=80&w=1200" alt="Abstract blue art" className="w-full h-full object-cover" />
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
                                <img src="https://images.unsplash.com/photo-1634733600136-47d3a8233843?q=80&w=800" alt="Abstract gradient" className="w-full h-full object-cover" />
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
            <Footer />
        </>
    );
};

export default HomePage;
