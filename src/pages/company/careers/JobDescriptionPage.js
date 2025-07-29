import React from 'react';
import { Link, useLocation } from 'react-router-dom';
const JobDescriptionPage = () => {
    const location = useLocation();
    const inheritedJob = location.state.job;
    const content = {
        description: [
            "job_description"
        ],
        responsibilities: [
            "job_reponsibility_1",
            "job_reponsibility_2",
            "job_reponsibility_3",
            "job_reponsibility_4",
            "job_reponsibility_5"
        ],
        qualifications: [
            "job_qualification_1",
            "job_qualification_2",
            "job_qualification_3",
            "job_qualification_4",
            "job_qualification_5"
        ]
    };

    return (
        <div className="bg-black text-white min-h-full p-8 md:p-16">
            <div className="max-w-4xl mx-auto">
                <div className="mb-12">
                    <Link to="/company/careers/search" className="text-neutral-400 hover:text-white transition-colors">
                        &laquo; Back to Careers
                    </Link>
                </div>

                <header className="mb-10">
                    <h1 className="text-4xl md:text-5xl font-bold">{inheritedJob.title}</h1>
                    <p className="text-neutral-400 mt-2">{inheritedJob.department} &middot; {inheritedJob.location}</p>
                </header>

                <div className="prose prose-invert prose-lg max-w-none">
                    <div className="mb-8">
                        {content.description.map((paragraph, index) => (
                            <p key={index}>{paragraph}</p>
                        ))}
                    </div>

                    <h2 className="font-bold text-2xl">Responsibilities</h2>
                    <ul className="list-disc list-inside">
                        {content.responsibilities.map((item, index) => (
                            <li key={index}>{item}</li>
                        ))}
                    </ul>

                    <h2 className="font-bold text-2xl mt-8">Qualifications</h2>
                    <ul className="list-disc list-inside">
                        {content.qualifications.map((item, index) => (
                            <li key={index}>{item}</li>
                        ))}
                    </ul>
                </div>
                <div className="mt-12">
                    <Link
                        to={`/company/careers/jobs/${inheritedJob.id}/apply`}
                        state={{ job: inheritedJob }}
                        className="bg-white text-black font-semibold py-3 px-8 rounded-md hover:bg-neutral-200 transition-colors"
                    >
                        Apply Now
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default JobDescriptionPage;
