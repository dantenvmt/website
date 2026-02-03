import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const HomePage = ({ setPage }) => {
    // State to hold all dynamic content from the database
    const [content, setContent] = useState({
        headline: null,
        news: [],
        stories: [],
        research: []
    });

    const [isLoading, setIsLoading] = useState(true);

    // Fetch Content from API
    useEffect(() => {
        const fetchContent = async () => {
            try {
                const response = await fetch('https://renaisons.com/api/get_content.php');
                const result = await response.json();
                if (result.status === 'success') {
                    setContent(result.data);
                }
            } catch (error) {
                console.error("Failed to load content:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchContent();
    }, []);

    // Helper to format date
    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    // Helper for placeholders if no image is provided
    const ImagePlaceholder = () => (
        <div className="w-full h-full flex items-center justify-center bg-neutral-800 text-neutral-500 text-xs uppercase tracking-wider">
            No Image
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto p-8 md:p-12">

            {/* --- 1. SEARCH SECTION (Static) --- */}
            <section className="py-20 px-4 sm:px-6 flex flex-col items-center text-center">
                <h2 className="text-3xl font-bold mb-8">What can I help with?</h2>
                <div className="w-full max-w-3xl relative">
                    <input
                        type="text"
                        className="w-full bg-neutral-800 text-white rounded-3xl px-6 py-6 pr-16 text-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600/50 transition-all"
                        placeholder="Ask anything..."
                    />
                    <button className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-gray-300 hover:bg-gray-400 text-white p-3 rounded-full transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-black" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 6.414V17a1 1 0 11-2 0V6.414L3.707 10.707a1 1 0 01-1.414-1.414l6-6z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </section>

            {/* --- 2. UPDATE BANNER (Static) --- */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-md p-3 flex items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <span className="bg-white text-black text-xs font-bold uppercase px-2 py-1 rounded">New</span>
                    <p className="text-sm text-neutral-300 hidden md:block">
                        Updates to ChatGPT business plans including connectors to internal tools.
                    </p>
                    <p className="text-sm text-neutral-300 md:hidden">
                        Updates to ChatGPT business plans.
                    </p>
                </div>
                <button
                    onClick={() => setPage && setPage('plans')}
                    className="text-white text-sm font-semibold whitespace-nowrap hover:underline"
                >
                    See plans
                </button>
            </div>

            {/* --- 3. MAIN HERO GRID --- */}
            <div className="lg:grid lg:grid-cols-3 gap-8 mb-24">

                {/* LEFT COLUMN: The Main Headline Story */}
                <div className="lg:sticky lg:top-24 h-fit lg:col-span-2">
                    {isLoading ? (
                        <div className="animate-pulse h-96 bg-neutral-800 rounded-md"></div>
                    ) : content.headline ? (
                        <Link to={`/news/${content.headline.id}`} className="group block">
                            <div className="aspect-video rounded-md overflow-hidden bg-neutral-800 shadow-lg">
                                {content.headline.image_url ? (
                                    <img
                                        src={content.headline.image_url}
                                        alt={content.headline.title}
                                        className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700 ease-out"
                                    />
                                ) : <ImagePlaceholder />}
                            </div>
                            <h2 className="text-2xl md:text-3xl font-bold mt-4 group-hover:text-blue-400 transition-colors">
                                {content.headline.title}
                            </h2>
                            <p className="text-neutral-400 mt-2 text-sm">
                                <span className="text-blue-400 font-semibold">{content.headline.category_name}</span>
                                <span className="mx-2">·</span>
                                {content.headline.read_time || '5 min read'}
                                <span className="mx-2">·</span>
                                {formatDate(content.headline.created_at)}
                            </p>
                        </Link>
                    ) : (
                        <div className="h-64 flex items-center justify-center bg-neutral-800 rounded-md text-neutral-500">
                            No Headline Story Set
                        </div>
                    )}
                </div>

                {/* RIGHT COLUMN: Recent Stories List */}
                <div className="lg:col-span-1 flex flex-col gap-8 mt-8 lg:mt-0">
                    {isLoading ? (
                        [1, 2, 3].map(i => <div key={i} className="animate-pulse h-32 bg-neutral-800 rounded-md"></div>)
                    ) : content.stories.length > 0 ? (
                        content.stories.slice(0, 3).map(story => (
                            <Link to={`/news/${story.id}`} key={story.id} className="group block">
                                <div className="aspect-[4/3] rounded-md overflow-hidden bg-neutral-800 mb-3 shadow-md">
                                    {story.image_url ? (
                                        <img
                                            src={story.image_url}
                                            alt={story.title}
                                            className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
                                        />
                                    ) : <ImagePlaceholder />}
                                </div>
                                <h3 className="font-semibold text-lg leading-tight group-hover:text-blue-400 transition-colors">
                                    {story.title}
                                </h3>
                                <p className="text-sm text-neutral-400 mt-1">
                                    {story.category_name} · {formatDate(story.created_at)}
                                </p>
                            </Link>
                        ))
                    ) : (
                        <p className="text-neutral-500 italic">No recent stories.</p>
                    )}
                </div>
            </div>

            {/* --- 4. LATEST NEWS SECTION --- */}
            <div className="mt-24 border-t border-neutral-800 pt-12">
                <h2 className="text-2xl font-bold mb-6">Latest news</h2>
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="animate-pulse h-32 bg-neutral-800 rounded-md"></div>
                        <div className="animate-pulse h-32 bg-neutral-800 rounded-md"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
                        {content.news.length > 0 ? (
                            content.news.map(item => (
                                <Link to={`/news/${item.id}`} key={item.id} className="flex items-start gap-6 group hover:bg-neutral-900/50 p-2 rounded-lg transition-colors -ml-2">
                                    <div className="w-32 h-32 rounded-md flex-shrink-0 overflow-hidden bg-neutral-800 shadow-sm">
                                        {item.image_url ? (
                                            <img
                                                src={item.image_url}
                                                alt={item.title}
                                                className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
                                            />
                                        ) : <ImagePlaceholder />}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg group-hover:text-blue-400 transition-colors">
                                            {item.title}
                                        </h3>
                                        <div className="flex flex-wrap gap-2 text-sm text-neutral-400 mt-2">
                                            <span className="text-blue-400">{item.category_name || 'General'}</span>
                                            <span>·</span>
                                            <span>{formatDate(item.created_at)}</span>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <p className="text-neutral-500">No news updates available.</p>
                        )}
                    </div>
                )}
            </div>

            {/* --- 5. STORIES SECTION (Grid View) --- */}
            <div className="mt-24 border-t border-neutral-800 pt-12">
                <h2 className="text-2xl font-bold mb-6">Featured Stories</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {content.stories.map(item => (
                        <Link to={`/news/${item.id}`} key={item.id} className="group block">
                            <div className="aspect-video rounded-md mb-3 overflow-hidden bg-neutral-800 shadow-md">
                                {item.image_url ? (
                                    <img
                                        src={item.image_url}
                                        alt={item.title}
                                        className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
                                    />
                                ) : <ImagePlaceholder />}
                            </div>
                            <h3 className="font-semibold text-lg group-hover:text-blue-400 transition-colors">
                                {item.title}
                            </h3>
                            <p className="text-sm text-neutral-400 mt-1">
                                {item.category_name || 'General'} · {formatDate(item.created_at)}
                            </p>
                        </Link>
                    ))}
                    {!isLoading && content.stories.length === 0 && (
                        <p className="text-neutral-500 col-span-full">No stories found.</p>
                    )}
                </div>
            </div>

            {/* --- 6. LATEST RESEARCH SECTION --- */}
            <div className="mt-24 border-t border-neutral-800 pt-12">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Latest research</h2>
                    <Link to="/research/index" className="text-sm font-semibold hover:underline text-blue-400">
                        View all research
                    </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {content.research.map((item) => (
                        <Link to={`/news/${item.id}`} key={item.id} className="group block">
                            <div className="rounded-md aspect-video overflow-hidden bg-neutral-800 mb-3 shadow-md">
                                {item.image_url ? (
                                    <img
                                        src={item.image_url}
                                        alt={item.title}
                                        className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
                                    />
                                ) : <ImagePlaceholder />}
                            </div>
                            <h3 className="font-semibold text-lg group-hover:text-blue-400 transition-colors">
                                {item.title}
                            </h3>
                            <p className="text-sm text-neutral-400 mt-1">
                                <span className="text-purple-400">{item.category_name || 'General'}</span> · {formatDate(item.created_at)}
                            </p>
                        </Link>
                    ))}
                    {!isLoading && content.research.length === 0 && (
                        <p className="text-neutral-500 col-span-full">No research articles found.</p>
                    )}
                </div>
            </div>

        </div>
    );
};

export default HomePage;