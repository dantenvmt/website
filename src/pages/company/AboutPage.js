import React from 'react';
import { mockNews } from '../../data/mockData'; // Import the mockNews data

const AboutPage = () => {
    return (
        // This container centers the content and sets a max-width
        <div className="max-w-7xl mx-auto p-8 md:p-12">
            <h1 className="text-4xl font-bold text-center mb-12">About</h1>

            {/* Top Image */}
            <div className="mb-24">
                <img
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200"
                    alt="Team collaboration in a bright office"
                    className="w-full h-auto rounded-xl object-cover"
                />
            </div>

            {/* Section 1: Vision */}
            <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
                <div className="max-w-md">
                    <h2 className="text-2xl font-semibold mb-4">Our vision for the future of AGI</h2>
                    <p className="text-neutral-400">
                        Our mission is to ensure that artificial general intelligence benefits all of humanity. We’re committed to building safe and beneficial AGI, but will also consider our mission fulfilled if our work aids others to achieve this outcome.
                    </p>
                </div>
                <div>
                    <img
                        src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800"
                        alt="Abstract data visualization"
                        className="w-full h-auto rounded-xl object-cover"
                    />
                </div>
            </div>

            {/* Section 2: Mission */}
            <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
                <div className="max-w-md md:order-2">
                    <h2 className="text-2xl font-semibold mb-4">We are building safe and beneficial AGI</h2>
                    <p className="text-neutral-400">
                        We believe that AGI has the potential to solve some of the world's most pressing problems. Our research focuses on creating systems that are not only powerful but also aligned with human values.
                    </p>
                </div>
                <div className="md:order-1">
                    <img
                        src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800"
                        alt="Close-up of a circuit board"
                        className="w-full h-auto rounded-xl object-cover"
                    />
                </div>
            </div>

            {/* Latest News Section - Updated to show category and date */}
            <div>
                <h2 className="text-2xl font-bold mb-6">Latest news</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                    {mockNews.map((item) => (
                        <div key={item.title}>
                            <div className="aspect-square rounded-lg overflow-hidden mb-2">
                                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                            <p className="text-sm text-neutral-400">
                                <span className="font-semibold text-white">{item.category}</span> · {item.date}
                            </p>
                        </div>

                    ))}
                </div>
            </div>

        </div>
    );
};

export default AboutPage;
