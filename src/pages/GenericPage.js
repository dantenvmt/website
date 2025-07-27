import React from 'react';

const GenericPage = ({ title }) => (
    <div className="p-12">
        <h1 className="text-4xl font-bold">{title}</h1>
        <p className="mt-4 text-neutral-400">Content for the {title} page goes here.</p>
    </div>
);

export default GenericPage;
