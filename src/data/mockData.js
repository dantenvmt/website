export const navLinks = [
    { id: 'home', title: 'Home' },
    { id: 'resume', title: 'Resume Optimization', userOnly: false },
    { id: 'job_board', title: 'Job Board' },
    { id: 'company', title: 'Company' },
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
            { id: 'contact', title: 'Contact Us' },
        ]
    }
};