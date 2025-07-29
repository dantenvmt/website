import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PrimaryButton } from '../../../components/common/Button';

const JobDescriptionRenderer = ({ text }) => {
    if (!text) return null;

    const knownHeadings = [
        "About the team",
        "About the role",
        "In this role, you'll:",
        "We're seeking someone with experience including:",
        "You might thrive in this role if you:",
        "About OpenAI",

    ];

    const blocks = text.split('\n').filter(block => block.trim() !== '');

    const renderedContent = [];
    let currentList = [];
    let isListSection = false;

    blocks.forEach((block, index) => {
        const trimmedBlock = block.trim();

        // Headings that we know introduce a list of items
        const listHeadings = [
            "In this role, you'll:",
            "We're seeking someone with experience including:",
            "You might thrive in this role if you:"
        ];

        const isHeading = knownHeadings.some(h => trimmedBlock.startsWith(h));
        const isListHeading = listHeadings.includes(trimmedBlock);

        if (isListHeading) {
            if (currentList.length > 0) {
                renderedContent.push(
                    <ul key={`list-pre-${index}`} className="list-disc list-outside space-y-2 pl-5 mb-6">
                        {currentList.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                );
                currentList = []; // Reset for the new section
            }
            renderedContent.push(<h2 key={index} className="text-2xl font-bold mt-8 mb-4">{trimmedBlock}</h2>);
            isListSection = true;
        } else if (isHeading) {
            if (currentList.length > 0) {
                renderedContent.push(
                    <ul key={`list-pre-${index}`} className="list-disc list-outside space-y-2 pl-5 mb-6">
                        {currentList.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                );
                currentList = [];
            }
            renderedContent.push(<h2 key={index} className="text-2xl font-bold mt-8 mb-4">{trimmedBlock}</h2>);
            isListSection = false;
        } else if (isListSection) {
            currentList.push(trimmedBlock);
        } else {
            renderedContent.push(<p key={index} className="mb-4">{trimmedBlock}</p>);
        }
    });

    if (currentList.length > 0) {
        renderedContent.push(
            <ul key="list-final" className="list-disc list-outside space-y-2 pl-5 mb-6">
                {currentList.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
        );
    }

    return <div>{renderedContent}</div>;
};


const JobPage = () => {
    const { id } = useParams(); // Gets the ':id' from the URL
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchJob = async () => {
            try {
                const response = await fetch(`https://renaisons-api.onrender.com/api/jobs/${id}`);
                if (!response.ok) {
                    throw new Error('Job not found');
                }
                const data = await response.json();
                setJob(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchJob();
    }, [id]);

    if (loading) return <div className="bg-black text-white text-center p-10">Loading...</div>;
    if (error) return <div className="bg-black text-red-500 text-center p-10">Error: {error}</div>;
    if (!job) return <div className="bg-black text-white text-center p-10">Job not found.</div>;

    return (
        <div className="bg-black text-white font-sans">
            <div className="max-w-3xl mx-auto py-16 px-6">
                <header className="text-center mb-12">
                    <p className="text-neutral-400 mb-2">Careers</p>
                    <h1 className="text-4xl md:text-5xl font-bold">{job.title}</h1>
                    <p className="text-lg text-neutral-300 mt-4">{job.department} - {job.location}</p>
                    <div className="mt-6">
                        <PrimaryButton as={Link} to={`/company/careers/jobs/${job._id}/apply`}>
                            Apply now
                        </PrimaryButton>
                    </div>
                </header>

                <main className="text-lg text-neutral-300">
                    <JobDescriptionRenderer text={job.description} />
                </main>

                <footer className="text-center mt-16">
                    <PrimaryButton as={Link} to={`/company/careers/jobs/${job._id}/apply`}>
                        Apply now
                    </PrimaryButton>
                </footer>
            </div>
        </div>
    );
};

export default JobPage;
