import React from 'react';

// This is a placeholder for all other pages.
// In a real app, you would create a separate file for each page (e.g., ResearchPage.js).
const GenericPage = ({ title }) => (
    <div className="p-12">
        <h1 className="text-4xl font-bold">{title}</h1>
        <p className="mt-4 text-neutral-400">Content for the {title} page goes here.</p>
    </div>
);

export default GenericPage;
