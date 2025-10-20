
export const navLinks = [
    { id: 'home', title: 'Home' },
    { id: 'resume', title: 'Resume Optimization' },
    { id: 'job_board', title: 'Job Board' },
    { id: 'company', title: 'Company' },
    { id: 'faq', title: 'FAQ' },
    { id: 'admin', title: 'Admin', adminOnly: true },
    { id: 'my-status', title: 'My Status', userOnly: true }

];

export const subNavLinks = {
    research: {
        title: 'Research',
        links: [
            { id: 'index', title: 'Research Index' },
            { id: 'overview', title: 'Research Overview' },
            { id: 'residency', title: 'Research Residency' },
        ],
        sections: [
            {
                title: 'Latest Advancements',
                links: [
                    { id: 'openai-o3', title: 'OpenAI o3 and o4-mini' },
                    { id: 'gpt-4.5', title: 'GPT-4.5' },
                    { id: 'sora', title: 'Sora' },
                ]
            }
        ]
    },
    company: {
        title: 'Company',
        links: [
            { id: 'about-us', title: 'About Us' },
            { id: 'careers', title: 'Careers' },
            { id: 'contact', title: 'Contact Us' },
            { id: 'terms-and-privacy', title: 'Terms & Privacy' },
        ]
    }
};


export const mockNews = [
    { title: 'Preparing for future AI risks in biology', category: 'Safety', date: 'Jul 18, 2025', imageUrl: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=800' },
    { title: 'Bringing the Magic of AI to Mattel’s Iconic Brands', category: 'Company', date: 'Jun 12, 2025', imageUrl: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=800' },
];

export const mockStories = [
    { title: 'Lyndon Barrois & Sora', category: 'Sora', date: 'Dec 4, 2024', imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800' },
    { title: 'Creating nail art with ChatGPT', category: 'ChatGPT', date: 'Feb 6, 2024', imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800' },
    { title: 'Economics and reasoning with Renaisons', category: 'ChatGPT', date: 'Sep 12, 2024', imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800' },
];
export const latestResearch = [
    {
        title: 'Pioneering an AI clinical copilot with Penda Health',
        category: 'Publication',
        date: 'Jul 22, 2025',
        imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800'
    },
    {
        title: 'Toward understanding and preventing misalignment generalization',
        category: 'Publication',
        date: 'Jun 18, 2025',
        imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800'
    }
];
