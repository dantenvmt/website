import React from 'react';
import { Link } from 'react-router-dom';
const CareerSearchPage = () => {
    const Job = {
        id: 'job_id',
        title: 'job_title',
        department: 'job_department',
        location: 'job_location',
        applyLink: '#'
    };

    return (
        <div className="bg-black text-white min-h-full p-8 md:p-16">
            <div className="max-w-4xl mx-auto">
                <header className="text-center mb-12">
                    <h1 className="text-5xl md:text-6xl font-bold">Careers at Renaisons</h1>
                </header>

                <div className="mb-10 pb-6 border-b border-neutral-800">
                    <p className="font-semibold text-neutral-400">Showing featured position</p>
                </div>

                <div className="space-y-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center py-4">
                        <div>
                            <Link
                                to={`/company/careers/jobs/${Job.id}`}
                                state={{ job: Job }}
                                className="text-lg font-semibold text-white hover:underline"
                            >
                                {Job.title}
                            </Link>
                            <p className="text-neutral-400">{Job.department}</p>
                        </div>
                        <div className="flex items-center gap-4 mt-2 md:mt-0">
                            <span className="text-neutral-300">{Job.location}</span>
                            <a href={Job.applyLink} className="text-white font-semibold hover:underline whitespace-nowrap">
                                Apply now »
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CareerSearchPage;
