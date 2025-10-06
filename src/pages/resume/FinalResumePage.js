import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useResume } from '../../context/ResumeContext';
import jsPDF from 'jspdf';
import AIKeywordAnalysis from '../../components/resume/AIKeywordAnalysis'; // Import the new component

// --- Helper component to render a single page ---
const ResumePage = ({ children, pageNumber, totalPages }) => (
    <div className="bg-white text-black p-8 font-serif shadow-lg my-4 relative" style={{ width: '210mm', minHeight: '350mm' }}>
        {children}
        {totalPages > 1 && (
            <div className="absolute bottom-4 right-4 text-xs text-gray-500">
                Page {pageNumber} of {totalPages}
            </div>
        )}
    </div>
);

// --- Draggable Section Wrapper ---
const DraggableResumeSection = ({ title, children, onDragStart, onDrop, onDragEnd, onDragOver, index, isDraggedItem, ...props }) => {
    return (
        <section
            {...props}
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
    const { contact, contactToggles, summary, experiences, educations, certifications, awards, skills, projects } = useResume();
    const navigate = useNavigate();
    const hiddenPreviewRef = useRef();
    const dragItem = useRef(null);
    const dragOverItem = useRef(null);
    const [orderedSections, setOrderedSections] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [paginatedContent, setPaginatedContent] = useState([]);

    useEffect(() => {
        const allSections = [
            { id: 'summary', title: 'Summary', condition: summary && summary.trim() !== '' },
            { id: 'experience', title: 'Experience', condition: experiences && experiences.length > 0 && experiences.some(exp => exp.role || exp.company) },
            { id: 'education', title: 'Education', condition: educations && educations.length > 0 && educations.some(edu => edu.degree || edu.school) },
            { id: 'projects', title: 'Projects', condition: projects && projects.length > 0 && projects.some(proj => proj.name) },
            { id: 'certifications', title: 'Certifications', condition: certifications && certifications.length > 0 && certifications.some(cert => cert.name) },
            { id: 'awards', title: 'Awards', condition: awards && awards.length > 0 && awards.some(award => award.name) },
            { id: 'skills', title: 'Skills', condition: skills && skills.trim() !== '' },
        ];
        setOrderedSections(allSections.filter(section => section.condition));
    }, [contact, summary, experiences, educations, certifications, awards, skills, projects]);

    // --- Pagination logic for PREVIEW (breaks between sections) ---
    useEffect(() => {
        if (hiddenPreviewRef.current && orderedSections.length > 0) {
            const PAGE_HEIGHT_PX = 1322.8; // Corresponds to 350mm
            const PAGE_MARGIN_PX = 64;    // Corresponds to p-8 (32px top + 32px bottom)
            const USABLE_PAGE_HEIGHT_PX = PAGE_HEIGHT_PX - PAGE_MARGIN_PX;

            const headerNode = hiddenPreviewRef.current.querySelector('header');
            const HEADER_HEIGHT_PX = headerNode ? headerNode.offsetHeight : 0;

            const pages = [];
            let currentPageSections = [];
            let currentHeight = 0;

            // First page has a header
            currentHeight += HEADER_HEIGHT_PX;

            const sectionNodes = hiddenPreviewRef.current.querySelectorAll('main > section');

            sectionNodes.forEach((node, index) => {
                const section = orderedSections[index];
                if (!section) return;

                const sectionHeight = node.offsetHeight;

                // If adding the section exceeds the page height, finalize the current page and start a new one.
                if (currentHeight + sectionHeight > USABLE_PAGE_HEIGHT_PX && currentPageSections.length > 0) {
                    pages.push(currentPageSections);
                    currentPageSections = [];
                    currentHeight = 0; // Reset height for the new page (no header on subsequent pages)
                }

                currentPageSections.push(section);
                currentHeight += sectionHeight;
            });

            // Add the last page
            if (currentPageSections.length > 0) {
                pages.push(currentPageSections);
            }

            setPaginatedContent(pages);
        } else {
            setPaginatedContent([]);
        }
    }, [orderedSections, contact, summary, experiences, educations, projects, certifications, awards, skills]);


    const formatPhoneNumber = (phoneNum) => {
        const cleaned = ('' + phoneNum).replace(/\D/g, '');
        const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
        if (match) return `(${match[1]}) ${match[2]}-${match[3]}`;
        return phoneNum;
    };

    const locationString = [contactToggles.city && contact.city, contactToggles.state && contact.state, contactToggles.country && contact.country].filter(Boolean).join(', ');
    const phoneNumber = contactToggles.phone ? formatPhoneNumber(contact.phone) : '';
    const linkedIn = (contactToggles.linkedin && contact.linkedin) ? `linkedin.com/in/${contact.linkedin}` : '';

    const handleDragStart = (e, position) => {
        dragItem.current = position;
        setTimeout(() => setIsDragging(true), 0);
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

    const handleDownloadPDF = () => {
        const doc = new jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: [210, 350]
        });
        doc.setFont('times');
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 10;
        const contentWidth = pageWidth - margin * 2;
        let y = 15;

        const FONT_SIZE = 10;
        const LINE_SPACING = 1.5;
        const PARAGRAPH_SPACING = 3;
        const SECTION_SPACING = 6;
        const LINE_HEIGHT = FONT_SIZE * 0.35 * LINE_SPACING;

        const checkPageBreak = (neededHeight) => {
            if (y + neededHeight > pageHeight - margin) {
                doc.addPage();
                y = margin;
            }
        };

        // --- Header ---
        doc.setFont('times', 'bold');
        doc.setFontSize(28);
        doc.text(contact.fullName || "Your Name", pageWidth / 2, y, { align: 'center' });
        y += (doc.getTextDimensions(contact.fullName).h * 0.5) + 2;

        doc.setFont('times', 'normal');
        doc.setFontSize(10);
        const contactItems = [locationString, contact.email, phoneNumber, linkedIn].filter(Boolean);
        const contactLine = contactItems.join('   |   ');
        doc.text(contactLine, pageWidth / 2, y, { align: 'center' });
        y += SECTION_SPACING + 4;

        // --- Sections ---
        orderedSections.forEach(section => {
            checkPageBreak(10);
            doc.setFont('times', 'bold');
            doc.setFontSize(10);
            doc.text(section.title.toUpperCase(), margin, y);
            y += 1;
            doc.setLineWidth(0.1);
            doc.line(margin, y, pageWidth - margin, y);
            y += 5;

            doc.setFont('times', 'normal');
            doc.setFontSize(FONT_SIZE);

            switch (section.id) {
                case 'summary':
                    const summaryLines = doc.splitTextToSize(summary, contentWidth);
                    summaryLines.forEach(line => {
                        checkPageBreak(LINE_HEIGHT);
                        doc.text(line, margin, y);
                        y += LINE_HEIGHT;
                    });
                    break;

                case 'experience':
                    experiences.forEach(exp => {
                        const headerHeight = LINE_HEIGHT * 2 + 1;
                        checkPageBreak(headerHeight + PARAGRAPH_SPACING);

                        doc.setFont('times', 'bold');
                        doc.text(exp.role, margin, y);
                        doc.setFont('times', 'normal');
                        doc.text(`${exp.startDate}${exp.endDate ? ` – ${exp.endDate}` : ''}`, pageWidth - margin, y, { align: 'right' });
                        y += LINE_HEIGHT;

                        doc.setFont('times', 'italic');
                        doc.text(exp.company, margin, y);
                        doc.setFont('times', 'normal');
                        doc.text(exp.location, pageWidth - margin, y, { align: 'right' });
                        y += LINE_HEIGHT + 1;

                        const bulletPoints = exp.bullets.split('\n').map(line => line.trim().replace(/^•\s*/, '')).filter(Boolean);
                        bulletPoints.forEach(bullet => {
                            const bulletLines = doc.splitTextToSize(bullet, contentWidth - 5);
                            const bulletHeight = bulletLines.length * LINE_HEIGHT;
                            checkPageBreak(bulletHeight);

                            bulletLines.forEach((line, index) => {
                                if (index === 0) {
                                    doc.text('•', margin + 2, y);
                                    doc.text(line, margin + 5, y);
                                } else {
                                    doc.text(line, margin + 5, y);
                                }
                                y += LINE_HEIGHT;
                            });
                        });
                        y += PARAGRAPH_SPACING;
                    });
                    break;

                case 'education':
                    educations.forEach(edu => {
                        const degreeAndMinor = [edu.degree, edu.minor].filter(Boolean).join(', ');
                        const eduHeaderHeight = LINE_HEIGHT * (edu.gpa ? 3 : 2);
                        checkPageBreak(eduHeaderHeight + PARAGRAPH_SPACING);

                        doc.setFont('times', 'bold');
                        doc.text(edu.school, margin, y);
                        doc.setFont('times', 'normal');
                        doc.text(`${edu.startDate}${edu.endDate ? ` – ${edu.endDate}` : ''}`, pageWidth - margin, y, { align: 'right' });
                        y += LINE_HEIGHT;

                        doc.setFont('times', 'italic');
                        doc.text(degreeAndMinor, margin, y);
                        doc.setFont('times', 'normal');
                        doc.text(edu.location, pageWidth - margin, y, { align: 'right' });
                        y += LINE_HEIGHT;

                        if (edu.gpa) {
                            doc.text(`GPA: ${edu.gpa}`, margin, y);
                            y += LINE_HEIGHT;
                        }

                        const bulletPoints = edu.bullets.split('\n').map(line => line.trim().replace(/^•\s*/, '')).filter(Boolean);
                        bulletPoints.forEach(bullet => {
                            const bulletLines = doc.splitTextToSize(bullet, contentWidth - 5);
                            const bulletHeight = bulletLines.length * LINE_HEIGHT;
                            checkPageBreak(bulletHeight);
                            bulletLines.forEach((line, index) => {
                                if (index === 0) {
                                    doc.text('•', margin + 2, y);
                                    doc.text(line, margin + 5, y);
                                } else {
                                    doc.text(line, margin + 5, y);
                                }
                                y += LINE_HEIGHT;
                            });
                        });
                        y += PARAGRAPH_SPACING;
                    });
                    break;

                case 'projects':
                case 'certifications':
                case 'awards':
                    const items = section.id === 'projects' ? projects : section.id === 'certifications' ? certifications : awards;
                    items.forEach(item => {
                        const relevanceLines = item.relevance ? doc.splitTextToSize(item.relevance, contentWidth) : [];
                        const itemHeight = LINE_HEIGHT + (relevanceLines.length * LINE_HEIGHT) + PARAGRAPH_SPACING;
                        checkPageBreak(itemHeight);

                        doc.setFont('times', 'bold');
                        doc.text(`${item.name}${item.organization ? `, ${item.organization}` : ''}`, margin, y);
                        doc.setFont('times', 'normal');
                        doc.text(item.date, pageWidth - margin, y, { align: 'right' });
                        y += LINE_HEIGHT;

                        if (item.relevance) {
                            relevanceLines.forEach(line => {
                                doc.text(line, margin, y);
                                y += LINE_HEIGHT;
                            });
                        }
                        y += PARAGRAPH_SPACING;
                    });
                    break;

                case 'skills':
                    const skillsLines = doc.splitTextToSize(skills, contentWidth);
                    skillsLines.forEach(line => {
                        checkPageBreak(LINE_HEIGHT);
                        doc.text(line, margin, y);
                        y += LINE_HEIGHT;
                    });
                    break;
                default: break;
            }
            y += SECTION_SPACING;
        });

        doc.save(`${contact.fullName.replace(/\s/g, '_') || 'Resume'}.pdf`);
    };

    const renderSectionContent = (section) => {
        // This function remains unchanged
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
                return educations.map(edu => {
                    const degreeAndMinor = [edu.degree, edu.minor].filter(Boolean).join(', ');
                    return (
                        <div key={edu.id} className="mb-4 last:mb-0">
                            <div className="flex justify-between items-baseline">
                                <h3 className="text-md font-bold text-gray-900">{edu.school}</h3>
                                <p className="text-xs font-normal text-gray-700">{edu.startDate}{edu.endDate && ` – ${edu.endDate}`}</p>
                            </div>
                            <div className="flex justify-between items-baseline">
                                <p className="text-sm italic text-gray-800">{degreeAndMinor}</p>
                                <p className="text-xs font-normal text-gray-700">{edu.location}</p>
                            </div>
                            {edu.gpa && (<p className="text-sm text-gray-800 mt-1">{`GPA: ${edu.gpa}`}</p>)}
                            {edu.bullets && edu.bullets.trim().replace(/^•\s*/, '') && (
                                <ul className="mt-2 text-sm text-gray-800 list-disc pl-5 space-y-1 leading-relaxed">
                                    {edu.bullets.split('\n').map((line, i) => {
                                        const cleanedLine = line.trim().replace(/^•\s*/, '');
                                        return cleanedLine && <li key={i}>{cleanedLine}</li>;
                                    })}
                                </ul>
                            )}
                        </div>
                    );
                });
            case 'projects':
                return projects.map(proj => (
                    proj.name && (
                        <div key={proj.id} className="mb-3">
                            <div className="flex justify-between items-baseline">
                                <h3 className="text-md font-bold text-gray-900">{proj.name}{proj.organization && `, ${proj.organization}`}</h3>
                                {proj.date && (<p className="text-xs font-normal text-gray-700">{proj.date}</p>)}
                            </div>
                            {proj.relevance && (<p className="text-sm text-gray-800 mt-1">{proj.relevance}</p>)}
                        </div>
                    )
                ));
            case 'certifications':
                return certifications.map(cert => (
                    cert.name && (
                        <div key={cert.id} className="mb-3">
                            <div className="flex justify-between items-baseline">
                                <h3 className="text-md font-bold text-gray-900">{cert.name}{cert.organization && `, ${cert.organization}`}</h3>
                                {cert.date && (<p className="text-xs font-normal text-gray-700">{cert.date}</p>)}
                            </div>
                            {cert.relevance && (<p className="text-sm text-gray-800 mt-1">{cert.relevance}</p>)}
                        </div>
                    )
                ));
            case 'awards':
                return awards.map(award => (
                    award.name && (
                        <div key={award.id} className="mb-3">
                            <div className="flex justify-between items-baseline">
                                <h3 className="text-md font-bold text-gray-900">{award.name}{award.organization && `, ${award.organization}`}</h3>
                                {award.date && (<p className="text-xs font-normal text-gray-700">{award.date}</p>)}
                            </div>
                            {award.relevance && (<p className="text-sm text-gray-800 mt-1">{award.relevance}</p>)}
                        </div>
                    )
                ));
            case 'skills':
                return <p className="text-sm text-gray-800">{skills}</p>;
            default:
                return null;
        }
    };

    return (
        <div className="text-white min-h-screen p-4 sm:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                        Back to Editor
                    </button>
                    <button onClick={handleDownloadPDF} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg">DOWNLOAD PDF</button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-gray-200 p-4 sm:p-8 rounded-lg flex flex-col items-center overflow-x-auto">
                        {paginatedContent.map((pageSections, pageIndex) => (
                            <ResumePage key={pageIndex} pageNumber={pageIndex + 1} totalPages={paginatedContent.length}>
                                {pageIndex === 0 && (
                                    <header className="text-center mb-6">
                                        <h1 className="text-3xl font-bold tracking-wider text-gray-900">{contact.fullName || "Your Name"}</h1>
                                        <div className="text-xs text-gray-700 mt-2">
                                            <p>{[locationString, contact.email, phoneNumber, linkedIn].filter(Boolean).join('   |   ')}</p>
                                        </div>
                                    </header>
                                )}
                                <main>
                                    {pageSections.map((section) => (
                                        <DraggableResumeSection
                                            key={section.id}
                                            title={section.title}
                                            index={orderedSections.findIndex(s => s.id === section.id)}
                                            onDragStart={(e) => handleDragStart(e, orderedSections.findIndex(s => s.id === section.id))}
                                            onDrop={handleDrop}
                                            onDragEnd={handleDragEnd}
                                            onDragOver={(e) => { e.preventDefault(); handleDragEnter(e, orderedSections.findIndex(s => s.id === section.id)); }}
                                            isDraggedItem={isDragging && dragItem.current === orderedSections.findIndex(s => s.id === section.id)}
                                        >
                                            {renderSectionContent(section)}
                                        </DraggableResumeSection>
                                    ))}
                                </main>
                            </ResumePage>
                        ))}
                    </div>

                    <div className="lg:col-span-1 space-y-8">
                        <AIKeywordAnalysis />
                    </div>
                </div>

                {/* Hidden div for measuring content height */}
                <div ref={hiddenPreviewRef} style={{ position: 'absolute', left: '-9999px', top: 0, opacity: 0, width: '210mm' }}>
                    <div className="bg-white text-black p-8 font-serif" style={{ width: '210mm', minHeight: '350mm' }}>

                        <header className="text-center mb-6">
                            <h1 className="text-3xl font-bold tracking-wider text-gray-900">{contact.fullName || "Your Name"}</h1>
                            <div className="text-xs text-gray-700 mt-2">
                                <p>{[locationString, contact.email, phoneNumber, linkedIn].filter(Boolean).join(' | ')}</p>
                            </div>
                        </header>
                        <main>
                            {orderedSections.map((section, index) => (
                                <section key={section.id} data-index={index} className="mt-5 py-2">
                                    <h2 className="text-xs font-bold uppercase tracking-widest text-gray-800 border-b border-black pb-1 mb-3">{section.title}</h2>
                                    {renderSectionContent(section)}
                                </section>
                            ))}
                        </main>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default FinalResumePage;