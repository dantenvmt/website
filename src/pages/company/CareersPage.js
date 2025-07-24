import React from 'react';
import { useNavigate } from 'react-router-dom';

const CareersPage = () => {
    const navigate = useNavigate();

    const handleNavigate = () => {
        navigate('/company/careers/search');
    };
    return (
        // Tgit gc --prune=nowhis is the main page container for padding
        <div className="p-8 md:p-12">

            {/* Section 1: Develop... (Narrower container) */}
            <div className="max-w-3xl mx-auto text-center mb-24">
                <h1 className="text-5xl md:text-7xl font-bold mb-4">Develop safe, beneficial AI systems</h1>
                <p className="text-neutral-300">We're looking for curious minds from a wide range of disciplines and backgrounds.</p>
                <button onClick={handleNavigate} className="mt-6 bg-white text-black font-semibold py-2 px-5 rounded-full hover:bg-neutral-200 transition-colors">
                    View open roles
                </button>
            </div>

            {/* Section 2: AI must be... (Wider container) */}
            <div className="max-w-5xl mx-auto text-center mb-16">
                <h1 className="text-2xl md:text-3xl font-bold">
                    AI must be advanced with knowledge of and respect for humanity's full spectrum of experiences and perspectives.
                </h1>
            </div>

            {/* Section 3: Values (Narrower container) */}
            <div className="max-w-3xl mx-auto">
                <div className="text-neutral-300 space-y-4">
                    <p>
                        <strong className="text-white">Values:</strong> These values define what we consider to be the most important things. They guide our decision-making. We believe that channeling these values is the most promising way to achieve our mission.
                    </p>
                    {/* Each principle is now indented */}
                    <p className="pl-6">
                        • <strong className="text-white">Humanity first.</strong> Working at OpenAI means being part of a team that is passionate about benefitting people and society through our work. We build AI to elevate humanity.
                    </p>
                    <p className="pl-6">
                        • <strong className="text-white">Act with humility.</strong> Humility reminds us to recognize the limits of our own knowledge and to remain open to new ideas, perspectives, and the possibility of being wrong. This mindset influences our iterative approach to deployment, and the reintegration of feedback into our research.
                    </p>
                    <p className="pl-6">
                        • <strong className="text-white">Feel the AGI.</strong> AGI will be powerful in an unprecedented way, with potential for upside and downside. Building it requires rigor and discipline, boundless imagination, and a deep sense of responsibility.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CareersPage;
