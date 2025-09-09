import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useResume } from '../../context/ResumeContext';

// --- Draggable Section Wrapper ---
const DraggableResumeSection = ({ title, children, onDragStart, onDrop, onDragEnd, onDragOver, index, isDraggedItem }) => {
    return (
        <section
            draggable="true"
            onDragStart={(e) => onDragStart(e, index)}
            onDrop={(e) => onDrop(e, index)}
            onDragOver={onDragOver}
            onDragEnd={onDragEnd}
            className={`mt-5 relative group cursor-grab py-2 transition-opacity ${isDraggedItem ? 'opacity-30' : 'opacity-100'}`}
        >
            <div className="absolute -left-10 top-0 h-full flex items-center opacity-0 group-hover:opacity-50 transition-opacity" title="Drag to reorder">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-800 border-b border-black pb-1 mb-3">{title}</h2>
            {children}
        </section>
    );
};

// --- Main Page Component ---
const FinalResumePage = () => {
    const { contact, contactToggles, summary, experiences, educations, certifications, awards, skills } = useResume();
    const resumePdfRef = useRef();
    const navigate = useNavigate();

    const dragItem = useRef(null);
    const dragOverItem = useRef(null);
    const [orderedSections, setOrderedSections] = useState([]);
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        const allSections = [
            { id: 'summary', title: 'Summary', condition: summary && summary.trim() !== '' },
            { id: 'experience', title: 'Experience', condition: experiences && experiences.length > 0 && experiences.some(exp => exp.role || exp.company) },
            { id: 'education', title: 'Education', condition: educations && educations.length > 0 && educations.some(edu => edu.degree || edu.school) },
            { id: 'certifications', title: 'Certifications', condition: certifications && certifications.length > 0 && certifications.some(cert => cert.name) },
            { id: 'awards', title: 'Awards', condition: awards && awards.length > 0 && awards.some(award => award.name) },
            { id: 'skills', title: 'Skills', condition: skills && skills.trim() !== '' },
        ];
        setOrderedSections(allSections.filter(section => section.condition));
    }, [contact, summary, experiences, educations, certifications, awards, skills]);

    const handleDragStart = (e, position) => {
        dragItem.current = position;
        setTimeout(() => {
            setIsDragging(true);
        }, 0);
    };

    const handleDragEnter = (e, position) => {
        dragOverItem.current = position;
    };

    const handleDragEnd = () => {
        setIsDragging(false);
        dragItem.current = null;
        dragOverItem.current = null;
    };

    const handleDrop = () => {
        if (dragItem.current === null || dragOverItem.current === null || dragItem.current === dragOverItem.current) {
            handleDragEnd();
            return;
        }
        const newSections = [...orderedSections];
        const dragItemContent = newSections[dragItem.current];
        newSections.splice(dragItem.current, 1);
        newSections.splice(dragOverItem.current, 0, dragItemContent);
        setOrderedSections(newSections);
        handleDragEnd();
    };

    const handleDownloadPDF = () => { alert('PDF download functionality will be implemented soon!'); };

    const renderSectionContent = (section) => {
        switch (section.id) {
            case 'summary':
                return <p className="text-sm text-gray-800 leading-relaxed">{summary}</p>;
            case 'experience':
                return experiences.map(exp => (
                    <div key={exp.id} className="mb-4 last:mb-0">
                        <div className="flex justify-between items-baseline">
                            <h3 className="text-md font-bold text-gray-900">{exp.role}</h3>
                            <p className="text-xs font-normal text-gray-700">{exp.startDate}{exp.endDate && ` – ${exp.endDate}`}</p>
                        </div>
                        <div className="flex justify-between items-baseline">
                            <p className="text-sm italic text-gray-800">{exp.company}</p>
                            <p className="text-xs font-normal text-gray-700">{exp.location}</p>
                        </div>
                        <ul className="mt-2 text-sm text-gray-800 list-disc pl-5 space-y-1 leading-relaxed">
                            {exp.bullets.split('\n').map((line, i) => {
                                const cleanedLine = line.trim().replace(/^•\s*/, '');
                                return cleanedLine && <li key={i}>{cleanedLine}</li>;
                            })}
                        </ul>
                    </div>
                ));
            case 'education':
                return educations.map(edu => (
                    <div key={edu.id} className="mb-3">
                        <div className="flex justify-between items-baseline">
                            <h3 className="text-md font-bold text-gray-900">{edu.school}</h3>
                            <p className="text-xs font-normal text-gray-700">{edu.startDate}{edu.endDate && ` – ${edu.endDate}`}</p>
                        </div>
                        <div className="flex justify-between items-baseline">
                            <p className="text-sm italic text-gray-800">{edu.degree}</p>
                            <p className="text-xs font-normal text-gray-700">{edu.location}</p>
                        </div>
                    </div>
                ));
            case 'certifications':
                return certifications.map(cert => (
                    cert.name && <p key={cert.id} className="text-sm text-gray-800">{cert.name}{cert.organization && `, ${cert.organization}`}</p>
                ));
            case 'awards':
                return awards.map(award => (
                    award.name && <p key={award.id} className="text-sm text-gray-800">{award.name}{award.organization && `, ${award.organization}`}</p>
                ));
            case 'skills':
                return <p className="text-sm text-gray-800">{skills}</p>;
            default:
                return null;
        }
    };

    const locationString = [
        contactToggles.city && contact.city,
        contactToggles.state && contact.state,
        contactToggles.country && contact.country,
    ].filter(Boolean).join(', ');

    return (
        <div className="bg-[#0f172a] text-white min-h-screen p-4 sm:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                        Back to Editor
                    </button>
                    <button onClick={handleDownloadPDF} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg">DOWNLOAD PDF</button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div
                        className={`lg:col-span-2 bg-white text-black p-8 sm:p-12 font-serif transition-all duration-300 rounded-lg ${isDragging ? 'border-2 border-dashed border-blue-500' : 'border-2 border-transparent'}`}
                        ref={resumePdfRef}
                        onDrop={handleDrop}
                        onDragOver={(e) => e.preventDefault()}
                    >
                        <header className="text-center mb-6">
                            <h1 className="text-3xl font-bold tracking-wider text-gray-900">{contact.fullName || "Your Name"}</h1>
                            <div className="text-xs text-gray-700 mt-2 flex justify-center items-center flex-wrap gap-x-4 gap-y-1">
                                {locationString && (
                                    <span className="flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                                        {locationString}
                                    </span>
                                )}
                                {contact.email && (
                                    <span className="flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>
                                        {contact.email}
                                    </span>
                                )}
                                {contact.phone && (
                                    <span className="flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>
                                        {contact.phone}
                                    </span>
                                )}
                            </div>
                        </header>
                        <main>
                            {orderedSections.map((section, index) => (
                                <DraggableResumeSection
                                    key={section.id}
                                    title={section.title}
                                    index={index}
                                    onDragStart={(e) => handleDragStart(e, index)}
                                    onDrop={handleDrop}
                                    onDragEnd={handleDragEnd}
                                    onDragOver={(e) => { e.preventDefault(); handleDragEnter(e, index); }}
                                    isDraggedItem={isDragging && dragItem.current === index}
                                >
                                    {renderSectionContent(section)}
                                </DraggableResumeSection>
                            ))}
                        </main>
                    </div>

                    <div className="lg:col-span-1 space-y-8">
                        <div className="bg-[#1e293b] border border-gray-700 rounded-lg p-6 text-center">
                            <h3 className="font-bold text-lg">AI Keyword Targeting</h3>
                            <p className="text-sm text-gray-400 mt-2">Optimize your resume with important keywords from the job description.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinalResumePage;

