import React, { useRef, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom'; // Import useParams
import { useResume } from '../../context/ResumeContext';
import jsPDF from 'jspdf';
import AIKeywordAnalysis from '../../components/resume/AIKeywordAnalysis';

// --- Helper component to render a single page ---
const ResumePage = ({ children, pageNumber, totalPages, height = '11in' }) => (
    <div className="bg-white text-black font-serif shadow-lg my-4 relative" style={{ width: '8.5in', height, padding: '1in' }}>
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
            // --- UPDATED: Increased section spacing ---
            className={`mt-0 relative group cursor-grab py-2 transition-opacity ${isDraggedItem ? 'opacity-30' : 'opacity-100'}`}
        >
            <div className="absolute -left-10 top-0 h-full flex items-center opacity-0 group-hover:opacity-50 transition-opacity" title="Drag to reorder">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </div>
            {/* --- UPDATED: Changed header font size to text-base (approx 11pt) --- */}
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-800 border-b border-black pb-1 mb-2">{title}</h2>
            {children}
        </section>
    );
};

// --- Main Page Component ---
const FinalResumePage = () => {
    const {
        contact, setContact,
        contactToggles,
        summary, setSummary,
        experiences, setExperiences,
        educations, setEducations,
        certifications, setCertifications,
        awards, setAwards,
        skills, setSkills,
        projects, setProjects
    } = useResume();

    const navigate = useNavigate();
    const { resumeId } = useParams(); // Get resumeId from the URL
    const hiddenPreviewRef = useRef();
    const dragItem = useRef(null);
    const dragOverItem = useRef(null);
    const [orderedSections, setOrderedSections] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [paginatedContent, setPaginatedContent] = useState([]);
    const PAGE_HEIGHT_PX = 1300;

    // --- Data Fetching useEffect (Unchanged) ---
    // src/pages/resume/FinalResumePage.js

    // --- Data Fetching useEffect ---
    useEffect(() => {
        const fetchResumeData = async () => {
            try {
                // --- UPDATE THE API URL IF NEEDED ---
                // Make sure this points to your actual API endpoint
                const response = await fetch(`https://renaisons.com/api/get_resume_details.php?resume_id=${resumeId}`, {
                    credentials: 'include' // Keep this if using sessions/cookies
                });
                // ------------------------------------

                const result = await response.json();

                if (result.status === 'success' && result.data) {
                    const { data } = result;

                    // --- BEGIN FIX ---
                    // 1. Get contact info OR initialize as empty object
                    const contactInfo = data.contact_info || {};

                    // 2. Get the resume_name from the top level of 'data'
                    const resumeNameFromApi = data.resume_name;

                    // 3. Set fullName: Prioritize contact_info.full_name, fallback to resume_name, then empty
                    contactInfo.fullName = contactInfo.full_name || resumeNameFromApi || '';
                    if (contactInfo.full_name) {
                        delete contactInfo.full_name; // Clean up the old key if it existed
                    }
                    // --- END FIX ---

                    // Set state with the (potentially updated) contactInfo
                    setContact(contactInfo);

                    // --- The rest of your state setting remains the same ---
                    setSummary(data.summary?.summaries_description || '');
                    setSkills(data.skills?.skills_description || '');
                    setExperiences(data.experiences || []);
                    setEducations(data.educations || []);
                    setAwards(data.awards || []);
                    setCertifications(data.certifications || []);
                    setProjects(data.projects || []);
                } else {
                    console.error("Failed to fetch resume details:", result.message);
                    // navigate('/resume'); // Consider removing navigation on fetch failure
                }
            } catch (error) {
                console.error("Error fetching resume data:", error);
            }
        };

        if (resumeId) {
            fetchResumeData();
        }
    }, [resumeId, navigate, setContact, setSummary, setSkills, setExperiences, setEducations, setAwards, setCertifications, setProjects]);


    // --- Section Ordering useEffect (Unchanged) ---
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

    // --- Pagination useEffect (Unchanged) ---
    useEffect(() => {
        if (hiddenPreviewRef.current && orderedSections.length > 0) {
            const PAGE_MARGIN_PX = 96;
            const USABLE_PAGE_HEIGHT_PX = PAGE_HEIGHT_PX - (PAGE_MARGIN_PX * 2);

            const headerNode = hiddenPreviewRef.current.querySelector('header');
            const HEADER_HEIGHT_PX = headerNode ? headerNode.offsetHeight : 0;

            const pages = [];
            let currentPageSections = [];
            let currentHeight = 0;

            currentHeight += HEADER_HEIGHT_PX;

            const sectionNodes = hiddenPreviewRef.current.querySelectorAll('main > section');

            sectionNodes.forEach((node, index) => {
                const section = orderedSections[index];
                if (!section) return;
                const sectionHeight = node.offsetHeight;
                if (currentHeight + sectionHeight > USABLE_PAGE_HEIGHT_PX && currentPageSections.length > 0) {
                    pages.push(currentPageSections);
                    currentPageSections = [];
                    currentHeight = 0;
                }
                currentPageSections.push(section);
                currentHeight += sectionHeight;
            });

            if (currentPageSections.length > 0) {
                pages.push(currentPageSections);
            }
            setPaginatedContent(pages);
        } else {
            setPaginatedContent([]);
        }
    }, [orderedSections]);

    // --- Helper Functions (Unchanged) ---
    const formatPhoneNumber = (phoneNum) => {
        const cleaned = ('' + phoneNum).replace(/\D/g, '');
        const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
        if (match) return `(${match[1]}) ${match[2]}-${match[3]}`;
        return phoneNum;
    };

    const locationString = [contactToggles.city && contact.city, contactToggles.state && contact.state, contactToggles.country && contact.country].filter(Boolean).join(', ');
    const phoneNumber = contactToggles.phone ? formatPhoneNumber(contact.phone) : '';
    const linkedIn = (contactToggles.linkedin && contact.linkedin) ? `linkedin.com/in/${contact.linkedin}` : '';

    // --- Drag and Drop Handlers (Unchanged) ---
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

    // --- PDF Download Handler (YOUR VALUES ARE ALREADY HERE) ---
    const handleDownloadPDF = () => {
        const doc = new jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'letter'
        });
        doc.setFont('times');
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 24; // 1 inch margin
        const contentWidth = pageWidth - margin * 2;
        let y = margin;

        // --- YOUR REQUESTED VALUES ARE ALREADY SET HERE ---
        const FONT_SIZE_BODY = 10;
        const FONT_SIZE_HEADER = 11;
        const FONT_SIZE_NAME = 17;
        const LINE_SPACING = 1.15;
        const PARAGRAPH_SPACING = 3;
        const SECTION_SPACING = 1;
        // --------------------------------------------------

        const LINE_HEIGHT_BODY = FONT_SIZE_BODY * 0.35 * LINE_SPACING;
        const LINE_HEIGHT_HEADER = FONT_SIZE_HEADER * 0.35 * LINE_SPACING;

        const checkPageBreak = (neededHeight) => {
            if (y + neededHeight > pageHeight - margin) {
                doc.addPage();
                y = margin;
            }
        };

        // --- Header ---
        doc.setFont('times', 'bold');
        doc.setFontSize(FONT_SIZE_NAME);
        doc.text(contact.fullName || "Your Name", pageWidth / 2, y, { align: 'center' });
        y += (doc.getTextDimensions(contact.fullName || ' ').h * 0.5) + 2;

        doc.setFont('times', 'normal');
        doc.setFontSize(10); // Using FONT_SIZE_BODY for contact line
        const contactItems = [locationString, contact.email, phoneNumber, linkedIn].filter(Boolean);
        const contactLine = contactItems.join('   |   ');
        doc.text(contactLine, pageWidth / 2, y, { align: 'center' });
        y += SECTION_SPACING + 4;

        // --- Sections (Unchanged) ---
        orderedSections.forEach(section => {
            checkPageBreak(10);
            doc.setFont('times', 'bold');
            doc.setFontSize(FONT_SIZE_HEADER);
            doc.text(section.title.toUpperCase(), margin, y);
            y += 1;
            doc.setLineWidth(0.1);
            doc.line(margin, y, pageWidth - margin, y);
            y += 5;

            doc.setFont('times', 'normal');
            doc.setFontSize(FONT_SIZE_BODY);

            switch (section.id) {
                case 'summary':
                    const summaryLines = doc.splitTextToSize(summary, contentWidth);
                    summaryLines.forEach(line => {
                        checkPageBreak(LINE_HEIGHT_BODY);
                        doc.text(line, margin, y);
                        y += LINE_HEIGHT_BODY;
                    });
                    break;

                case 'experience':
                    experiences.forEach(exp => {
                        const headerHeight = LINE_HEIGHT_HEADER * 2 + 1;
                        checkPageBreak(headerHeight + PARAGRAPH_SPACING);

                        doc.setFontSize(FONT_SIZE_BODY);
                        doc.setFont('times', 'bold');
                        doc.text(exp.role, margin, y);
                        // NEW:
                        doc.text(exp.location, pageWidth - margin, y, { align: 'right' });

                        y += LINE_HEIGHT_HEADER;

                        doc.setFont('times', 'italic');
                        doc.text(exp.company, margin, y);
                        const expDateString = [exp.startDate, exp.endDate].filter(Boolean).join(' – ');
                        doc.text(expDateString, pageWidth - margin, y, { align: 'right' });
                        y += LINE_HEIGHT_HEADER + 1;

                        doc.setFont('times', 'normal');
                        doc.setFontSize(FONT_SIZE_BODY);

                        const bulletPoints = (exp.bullets || '').split('\n').map(line => line.trim().replace(/^•\s*/, '')).filter(Boolean);
                        bulletPoints.forEach(bullet => {
                            const bulletLines = doc.splitTextToSize(bullet, contentWidth - 5);
                            const bulletHeight = bulletLines.length * LINE_HEIGHT_BODY;
                            checkPageBreak(bulletHeight);

                            bulletLines.forEach((line, index) => {
                                if (index === 0) {
                                    doc.text('•', margin + 2, y);
                                    doc.text(line, margin + 5, y);
                                } else {
                                    doc.text(line, margin + 5, y);
                                }
                                y += LINE_HEIGHT_BODY;
                            });
                        });
                        y += PARAGRAPH_SPACING;
                    });
                    break;

                case 'education':
                    educations.forEach(edu => {
                        const degreeAndMinor = [edu.degree, edu.minor].filter(Boolean).join(', ');
                        const eduHeaderHeight = LINE_HEIGHT_HEADER * (edu.gpa ? 3 : 2);
                        const gpaString = edu.gpa ? ` | GPA: ${edu.gpa}` : ''; // Create GPA string
                        checkPageBreak(eduHeaderHeight + PARAGRAPH_SPACING);

                        doc.setFontSize(FONT_SIZE_BODY);
                        doc.setFont('times', 'bold');
                        doc.text(edu.school, margin, y);

                        doc.text(edu.location, pageWidth - margin, y, { align: 'right' });
                        // NEW:

                        y += LINE_HEIGHT_HEADER;

                        doc.setFont('times', 'italic');
                        const eduDateString = [edu.startDate, edu.endDate].filter(Boolean).join(' – ');
                        doc.text(eduDateString, pageWidth - margin, y, { align: 'right' });
                        doc.text(degreeAndMinor + gpaString, margin, y);
                        doc.setFont('times', 'normal');
                        y += LINE_HEIGHT_HEADER;

                        doc.setFontSize(FONT_SIZE_BODY);

                        const bulletPoints = (edu.bullets || '').split('\n').map(line => line.trim().replace(/^•\s*/, '')).filter(Boolean);
                        bulletPoints.forEach(bullet => {
                            const bulletLines = doc.splitTextToSize(bullet, contentWidth - 5);
                            const bulletHeight = bulletLines.length * LINE_HEIGHT_BODY;
                            checkPageBreak(bulletHeight);
                            bulletLines.forEach((line, index) => {
                                if (index === 0) {
                                    doc.text('•', margin + 2, y);
                                    doc.text(line, margin + 5, y);
                                } else {
                                    doc.text(line, margin + 5, y);
                                }
                                y += LINE_HEIGHT_BODY;
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
                        // Check height for the header
                        checkPageBreak(LINE_HEIGHT_HEADER);

                        // Render item header (Name, Org, Date)
                        doc.setFont('times', 'bold');
                        doc.text(`${item.name}${item.organization ? `, ${item.organization}` : ''}`, margin, y);
                        doc.setFont('times', 'normal');
                        doc.text(item.date, pageWidth - margin, y, { align: 'right' });
                        y += LINE_HEIGHT_BODY;

                        doc.setFontSize(FONT_SIZE_BODY);

                        // --- START NEW BULLET LOGIC ---
                        // Split 'relevance' by newlines, just like 'bullets'
                        const bulletPoints = (item.relevance || '').split('\n')
                            .map(line => line.trim().replace(/^•\s*/, '').trim()) // Clean and trim
                            .filter(Boolean); // Filter out empty lines

                        bulletPoints.forEach(bullet => {
                            const bulletLines = doc.splitTextToSize(bullet, contentWidth - 5); // Wrap each bullet
                            const bulletHeight = bulletLines.length * LINE_HEIGHT_BODY;
                            checkPageBreak(bulletHeight);

                            bulletLines.forEach((line, index) => {
                                if (index === 0) {
                                    doc.text('•', margin + 2, y); // Draw the bullet
                                    doc.text(line, margin + 5, y); // Draw the text
                                } else {
                                    doc.text(line, margin + 5, y); // Draw wrapped text
                                }
                                y += LINE_HEIGHT_BODY;
                            });
                        });
                        // --- END NEW BULLET LOGIC ---

                        y += PARAGRAPH_SPACING; // Add space after the item
                    });
                    break;

                case 'skills':
                    const skillsLines = doc.splitTextToSize(skills, contentWidth);
                    skillsLines.forEach(line => {
                        checkPageBreak(LINE_HEIGHT_BODY);
                        doc.text(line, margin, y);
                        y += LINE_HEIGHT_BODY;
                    });
                    break;
                default: break;
            }
            y += SECTION_SPACING;
        });


        doc.save(`${(contact.fullName || 'Resume').replace(/\s/g, '_')}.pdf`);
    };

    const renderSectionContent = (section) => {
        switch (section.id) {
            case 'summary':
                return <p className="text-sm text-gray-800 leading-normal whitespace-pre-wrap">{summary}</p>;
            case 'experience':
                return experiences.map(exp => (
                    <div key={exp.id} className="mb-2 last:mb-0"> {/* UPDATED: mb-3 (approx PARAGRAPH_SPACING) */}
                        <div className="flex justify-between items-baseline">
                            <h3 className="text-sm font-bold text-gray-900">{exp.role}</h3>
                            <p className="text-xs font-normal text-gray-700">{exp.startDate}{exp.endDate && ` – ${exp.endDate}`}</p>
                        </div>
                        <div className="flex justify-between items-baseline">
                            {/* UPDATED: text-sm (approx 10pt) */}
                            <p className="text-xs italic text-gray-800">{exp.company}</p>
                            {/* UPDATED: text-sm (approx 10pt) */}
                            <p className="text-xs font-normal text-gray-700">{exp.location}</p>
                        </div>
                        {/* --- UPDATED: text-sm, space-y-1, leading-normal --- */}
                        <ul className="mt-1 text-xs text-gray-800 list-disc pl-5 space-y-1 leading-normal">
                            {exp.bullets && exp.bullets.split('\n').map((line, i) => {
                                const cleanedLine = line.trim().replace(/^•\s*/, '');
                                return cleanedLine && <li key={i}>{cleanedLine}</li>;
                            })}
                        </ul>
                    </div>
                ));
            case 'education':
                return educations.map(edu => {
                    const degreeAndMinor = [edu.degree, edu.minor].filter(Boolean).join(', ');
                    const gpaString = edu.gpa ? ` | GPA: ${edu.gpa}` : '';
                    return (
                        <div key={edu.id} className="mb-2 last:mb-0"> {/* UPDATED: mb-3 */}
                            <div className="flex justify-between items-baseline">
                                {/* UPDATED: text-base (approx 11pt) */}
                                <h3 className="text-sm font-bold text-gray-900">{edu.school}</h3>
                                {/* UPDATED: text-sm (approx 10pt) */}
                                <p className="text-xs font-normal text-gray-700">{edu.startDate}{edu.endDate && ` – ${edu.endDate}`}</p>
                            </div>
                            <div className="flex justify-between items-baseline">
                                {/* UPDATED: text-sm (approx 10pt) */}
                                <p className="text-xs italic text-gray-800">{degreeAndMinor}{gpaString}</p>
                                {/* UPDATED: text-sm (approx 10pt) */}
                                <p className="text-xs font-normal text-gray-700">{edu.location}</p>
                            </div>
                            {/* UPDATED: text-sm (approx 10pt) */}
                            {edu.bullets && edu.bullets.trim().replace(/^•\s*/, '') && (
                                // --- UPDATED: text-sm, space-y-1, leading-normal ---
                                <ul className="mt-1 text-xs text-gray-800 list-disc pl-5 space-y-1 leading-normal break-words whitespace-pre-wrap">
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
            case 'certifications':
            case 'awards':
                const items = section.id === 'projects' ? projects : section.id === 'certifications' ? certifications : awards;
                return items.map(item => (
                    item.name && (
                        <div key={item.id} className="mb-2"> {/* UPDATED: mb-3 */}
                            <div className="flex justify-between items-baseline">
                                {/* UPDATED: text-base (approx 11pt) */}
                                <h3 className="text-xs font-bold text-gray-900">{item.name}{item.organization && `, ${item.organization}`}</h3>
                                {/* UPDATED: text-sm (approx 10pt) */}
                                {item.date && (<p className="text-xs font-normal text-gray-700">{item.date}</p>)}
                            </div>
                            {item.relevance && (
                                // --- UPDATED: text-sm, space-y-1, leading-normal ---
                                <ul className="mt-1 text-xs text-gray-800 list-disc pl-5 space-y-1 leading-normal break-words whitespace-pre-wrap">
                                    {item.relevance.split('\n').map((line, i) => {
                                        const cleanedLine = line.trim().replace(/^•\s*/, '');
                                        return cleanedLine && <li key={i}>{cleanedLine}</li>;
                                    })}
                                </ul>
                            )}
                        </div>
                    )
                ));
            case 'skills':
                return (
                    // --- UPDATED: text-sm, space-y-1, leading-normal ---
                    <ul className="text-xs text-gray-800 list-disc pl-5 space-y-1 leading-normal break-words whitespace-pre-wrap">
                        {skills.split('\n').map((line, i) => {
                            const cleanedLine = line.trim().replace(/^•\s*/, '');
                            return cleanedLine && <li key={i}>{cleanedLine}</li>;
                        })}
                    </ul>
                );
            default:
                return null;
        }
    };

    // --- MAIN RETURN (JSX RENDER) ---
    return (
        <div className="text-white min-h-screen p-4 sm:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                    <button onClick={() => navigate(`/resume/${resumeId}/contact`)} className="flex items-center gap-2 text-gray-400 hover:text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                        Back to Editor
                    </button>
                    <button onClick={handleDownloadPDF} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg">DOWNLOAD PDF</button>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-gray-200 p-4 sm:p-8 rounded-lg flex flex-col items-center overflow-x-auto">
                        {paginatedContent.map((pageSections, pageIndex) => (
                            <ResumePage key={pageIndex} pageNumber={pageIndex + 1} totalPages={paginatedContent.length} height={`${PAGE_HEIGHT_PX / 96}in`}>
                                {pageIndex === 0 && (
                                    <header className="text-center mb-6">
                                        {/* --- UPDATED: text-2xl (approx 17pt) --- */}
                                        <h1 className="text-xl font-bold tracking-wider text-gray-900">{contact.fullName || "Your Name"}</h1>
                                        {/* --- UPDATED: text-sm (approx 10pt) --- */}
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

                {/* --- Hidden Preview for Pagination Calc (STYLES UPDATED) --- */}
                <div ref={hiddenPreviewRef} style={{ position: 'absolute', left: '-9999px', top: 0, opacity: 0, width: '8.5in' }}>
                    <div className="bg-white text-black font-serif" style={{ width: '8.5in', minHeight: '11in', padding: '1in' }}>
                        <header className="text-center mb-6">
                            {/* --- UPDATED: text-2xl --- */}
                            <h1 className="text-2xl font-bold tracking-wider text-gray-900">{contact.fullName || "Your Name"}</h1>
                            {/* --- UPDATED: text-sm --- */}
                            <div className="text-sm text-gray-700 mt-2">
                                <p>{[locationString, contact.email, phoneNumber, linkedIn].filter(Boolean).join(' | ')}</p>
                            </div>
                        </header>
                        <main>
                            {orderedSections.map((section, index) => (
                                <section key={section.id} data-index={index} className="mt-4 py-2">
                                    <h2 className="text-base font-bold uppercase tracking-widest text-gray-800 border-b border-black pb-1 mb-2">{section.title}</h2>
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