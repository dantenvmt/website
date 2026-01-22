import React, { useRef, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useResume } from '../../context/ResumeContext';
import jsPDF from 'jspdf';
import AIKeywordAnalysis from '../../components/resume/AIKeywordAnalysis';

// --- Pragmatic Drag and Drop Imports ---
import { 
    monitorForElements,
    draggable,
    dropTargetForElements
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { 
    attachClosestEdge, 
    extractClosestEdge 
} from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';

// --- Helper Component for Page Layout ---
const ResumePage = ({ children, pageNumber, totalPages, height = '8in' }) => (
    <div className="bg-white text-black font-serif shadow-lg my-4 relative transition-transform origin-top scale-[0.6] sm:scale-[0.7]md:scale-[0.8] xl:scale-95" style={{ width: '8.5in', minHeight: height, padding: '0.5in' }}>
        {children}
        {totalPages > 1 && (
            <div className="absolute bottom-4 right-4 text-xs text-gray-500">
                Page {pageNumber} of {totalPages}
            </div>
        )}
    </div>
);

// --- Draggable Preview Item Component ---
const DraggablePreviewItem = ({ id, type, index, dataId, sectionId, children, disabled }) => {
    const ref = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [closestEdge, setClosestEdge] = useState(null);

    useEffect(() => {
        const element = ref.current;
        if (!element || disabled) return;

        return combine(
            draggable({
                element,
                getInitialData: () => ({ id, index, type, dataId, sectionId }),
                onDragStart: () => setIsDragging(true),
                onDrop: () => setIsDragging(false),
            }),
            dropTargetForElements({
                element,
                getData: ({ input }) => attachClosestEdge({ id, index, type, dataId, sectionId }, { element, input, allowedEdges: ['top', 'bottom'] }),
                onDragEnter: ({ self }) => setClosestEdge(extractClosestEdge(self.data)),
                onDragLeave: () => setClosestEdge(null),
                onDrop: () => {
                    setClosestEdge(null);
                    setIsDragging(false);
                },
            })
        );
    }, [id, index, type, dataId, sectionId, disabled]);

    const edgeStyle = closestEdge === 'top' ? 'border-t-2 border-blue-500' : 
                      closestEdge === 'bottom' ? 'border-b-2 border-blue-500' : '';
    const draggingStyle = isDragging ? 'opacity-30' : '';
    const cursorStyle = disabled ? 'cursor-default' : (type === 'header' ? 'cursor-move hover:bg-gray-100' : 'cursor-grab hover:bg-gray-50');

    return (
        <div ref={ref} className={`relative group ${draggingStyle} ${edgeStyle} ${cursorStyle} transition-colors`}>
            {!disabled && (
                <div className="absolute -left-6 top-0 h-full flex items-start pt-1 opacity-0 group-hover:opacity-40 transition-opacity pointer-events-none">
                     <span className="text-gray-400 text-xs">⋮⋮</span>
                </div>
            )}
            {children}
        </div>
    );
};

const FinalResumePage = () => {
    const {
        contact, setContact, contactToggles,
        summary, setSummary,
        experiences, setExperiences,
        educations, setEducations,
        certifications, setCertifications,
        awards, setAwards,
        skills, setSkills,
        projects, setProjects,
        reorderSection
    } = useResume();

    const navigate = useNavigate();
    const { resumeId } = useParams();
    const hiddenPreviewRef = useRef();
    
    // --- State to control Section Order ---
    const [sectionOrder, setSectionOrder] = useState([
        'summary', 'experience', 'education', 'projects', 'certifications', 'awards', 'skills'
    ]);

    const [orderedSections, setOrderedSections] = useState([]);
    const [paginatedContent, setPaginatedContent] = useState([]);
    const PAGE_HEIGHT_PX = 1300; 

    // --- 1. Monitor for Drops ---
    useEffect(() => {
        return monitorForElements({
            onDrop({ source, location }) {
                const destination = location.current.dropTargets[0];
                if (!destination) return;

                const srcType = source.data.type;
                const dstType = destination.data.type;

                // Reorder Whole Sections
                if (srcType === 'header' && dstType === 'header') {
                    const srcSectionId = source.data.sectionId;
                    const dstSectionId = destination.data.sectionId;
                    if (srcSectionId === dstSectionId) return;

                    setSectionOrder(prevOrder => {
                        const newOrder = [...prevOrder];
                        const srcIdx = newOrder.indexOf(srcSectionId);
                        const dstIdx = newOrder.indexOf(dstSectionId);
                        if (srcIdx !== -1 && dstIdx !== -1) {
                            newOrder.splice(srcIdx, 1);
                            newOrder.splice(dstIdx, 0, srcSectionId);
                        }
                        return newOrder;
                    });
                    return;
                }

                // Reorder Items within a Section
                if (srcType !== dstType) return;
                const srcId = source.data.dataId; 
                const dstId = destination.data.dataId;
                let sourceArray, sectionKey;

                if (srcType === 'experience-item') { sourceArray = experiences; sectionKey = 'experience'; }
                else if (srcType === 'projects-item') { sourceArray = projects; sectionKey = 'projects'; }
                else if (srcType === 'education-item') { sourceArray = educations; sectionKey = 'education'; }
                else if (srcType === 'cert-item') { sourceArray = certifications; sectionKey = 'certifications'; }
                else if (srcType === 'award-item') { sourceArray = awards; sectionKey = 'awards'; }
                
                if (sourceArray && sectionKey && reorderSection) {
                    const srcIdx = sourceArray.findIndex(i => i.id === srcId);
                    const dstIdx = sourceArray.findIndex(i => i.id === dstId);
                    if (srcIdx !== -1 && dstIdx !== -1 && srcIdx !== dstIdx) {
                        reorderSection(sectionKey, srcIdx, dstIdx);
                    }
                }
            },
        });
    }, [experiences, projects, educations, certifications, awards, reorderSection]);

    // --- 2. Fetch Data ---
    useEffect(() => {
        if (resumeId) {
             fetch(`https://renaisons.com/api/get_resume_details.php?resume_id=${resumeId}`)
                .then(res => res.json())
                .then(result => {
                    if (result.status === 'success' && result.data) {
                        const { data } = result;
                        setExperiences(data.experiences || []);
                        setProjects(data.projects || []);
                        setEducations(data.educations || []);
                        setCertifications(data.certifications || []);
                        setAwards(data.awards || []);
                        setSummary(data.summary?.summaries_description || '');
                        setSkills(data.skills?.skills_description || '');
                        const contactInfo = data.contact_info || {};
                        contactInfo.fullName = contactInfo.full_name || data.resume_name || '';
                        setContact(contactInfo);
                    }
                })
                .catch(err => console.error(err));
        }
    }, [resumeId, setContact, setExperiences, setProjects, setEducations, setSummary, setCertifications, setAwards, setSkills]);

    // --- 3. Generate Granular Sections ---
    useEffect(() => {
        const granular = [];
        sectionOrder.forEach(sectionId => {
            switch (sectionId) {
                case 'summary':
                    if (summary && summary.trim()) {
                        granular.push({ id: 'summary-header', type: 'header', title: 'Summary', sectionId: 'summary' });
                        granular.push({ id: 'summary-item', type: 'summary-content', content: summary });
                    }
                    break;
                case 'experience':
                    if (experiences?.length) {
                        granular.push({ id: 'experience-header', type: 'header', title: 'Experience', sectionId: 'experience' });
                        experiences.forEach(exp => granular.push({ id: `exp-${exp.id}`, dataId: exp.id, type: 'experience-item', data: exp }));
                    }
                    break;
                case 'education':
                    if (educations?.length) {
                        granular.push({ id: 'education-header', type: 'header', title: 'Education', sectionId: 'education' });
                        educations.forEach(edu => granular.push({ id: `edu-${edu.id}`, dataId: edu.id, type: 'education-item', data: edu }));
                    }
                    break;
                case 'projects':
                    if (projects?.length) {
                        granular.push({ id: 'projects-header', type: 'header', title: 'Projects', sectionId: 'projects' });
                        projects.forEach(proj => granular.push({ id: `proj-${proj.id}`, dataId: proj.id, type: 'projects-item', data: proj }));
                    }
                    break;
                case 'certifications':
                    if (certifications?.length) {
                        granular.push({ id: 'certifications-header', type: 'header', title: 'Certifications', sectionId: 'certifications' });
                        certifications.forEach(cert => granular.push({ id: `cert-${cert.id}`, dataId: cert.id, type: 'cert-item', data: cert }));
                    }
                    break;
                case 'awards':
                    if (awards?.length) {
                        granular.push({ id: 'awards-header', type: 'header', title: 'Awards', sectionId: 'awards' });
                        awards.forEach(award => granular.push({ id: `award-${award.id}`, dataId: award.id, type: 'award-item', data: award }));
                    }
                    break;
                case 'skills':
                    if (skills && skills.trim()) {
                        granular.push({ id: 'skills-header', type: 'header', title: 'Skills', sectionId: 'skills' });
                        granular.push({ id: 'skills-item', type: 'skills-content', content: skills });
                    }
                    break;
                default: break;
            }
        });
        setOrderedSections(granular);
    }, [experiences, projects, educations, certifications, awards, summary, skills, sectionOrder]);

    // --- 4. Pagination Logic ---
    useEffect(() => {
        if (hiddenPreviewRef.current && orderedSections.length > 0) {
            const PAGE_MARGIN = 80;
            const USABLE_HEIGHT = PAGE_HEIGHT_PX - PAGE_MARGIN*2;
            
            const headerEl = hiddenPreviewRef.current.querySelector('header');
            let currentH = headerEl ? headerEl.offsetHeight : 0;

            const pages = [];
            let currentPage = [];
            
            const itemNodes = hiddenPreviewRef.current.querySelectorAll('.granular-item');
            
            itemNodes.forEach((node, idx) => {
                const itemData = orderedSections[idx];
                const itemH = node.offsetHeight;

                if (currentH + itemH > USABLE_HEIGHT && currentPage.length > 0) {
                    pages.push(currentPage);
                    currentPage = [];
                    currentH = 0; 
                }
                currentPage.push(itemData);
                currentH += itemH;
            });

            if (currentPage.length > 0) pages.push(currentPage);
            setPaginatedContent(pages);
        }
    }, [orderedSections]);

    // --- 5. UPDATED PDF GENERATOR (Fixes Download Issue) ---
    const handleDownloadPDF = () => {
        const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'letter' });
        doc.setFont('times');
        
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 24; 
        const contentWidth = pageWidth - margin * 2;
        let y = margin;

        const FONT_SIZE_BODY = 10;
        const FONT_SIZE_HEADER = 11;
        const FONT_SIZE_NAME = 17;
        const LINE_SPACING = 1.15;
        const PARAGRAPH_SPACING = 3;
        
        const LINE_HEIGHT_BODY = FONT_SIZE_BODY * 0.35 * LINE_SPACING;
        const LINE_HEIGHT_HEADER = FONT_SIZE_HEADER * 0.35 * LINE_SPACING;

        const checkPageBreak = (neededHeight) => {
            if (y + neededHeight > pageHeight - margin) {
                doc.addPage();
                y = margin;
            }
        };

        // --- PDF Header ---
        doc.setFont('times', 'bold');
        doc.setFontSize(FONT_SIZE_NAME);
        doc.text(contact.fullName || "Your Name", pageWidth / 2, y, { align: 'center' });
        y += (doc.getTextDimensions(contact.fullName || ' ').h) + 2;

        doc.setFont('times', 'normal');
        doc.setFontSize(FONT_SIZE_BODY);
        
        const locationString = [contactToggles.city && contact.city, contactToggles.state && contact.state, contactToggles.country && contact.country].filter(Boolean).join(', ');
        const contactLine = [
            locationString, 
            contact.email, 
            contactToggles.phone ? contact.phone : '', 
            (contactToggles.linkedin && contact.linkedin) ? `linkedin.com/in/${contact.linkedin}` : ''
        ].filter(Boolean).join('   |   ');
        
        doc.text(contactLine, pageWidth / 2, y, { align: 'center' });
        y += 8; // Spacing after contact info

        // --- Loop through GRANULAR items for PDF ---
        orderedSections.forEach(item => {
            if (item.type === 'header') {
                checkPageBreak(15);
                y += 2;
                doc.setFont('times', 'bold');
                doc.setFontSize(FONT_SIZE_HEADER);
                doc.text(item.title.toUpperCase(), margin, y);
                y += 1.5;
                doc.setLineWidth(0.1);
                doc.line(margin, y, pageWidth - margin, y);
                y += 5;
            } else {
                // Content Items
                doc.setFont('times', 'normal');
                doc.setFontSize(FONT_SIZE_BODY);

                if (item.type === 'summary-content' || item.type === 'skills-content') {
                     const lines = doc.splitTextToSize(item.content || '', contentWidth);
                     checkPageBreak(lines.length * LINE_HEIGHT_BODY);
                     doc.text(lines, margin, y);
                     y += lines.length * LINE_HEIGHT_BODY + PARAGRAPH_SPACING;

                } else if (item.type === 'experience-item') {
                    const exp = item.data;
                    const dates = [exp.startDate, exp.endDate].filter(Boolean).join(' – ');
                    
                    // Role & Date
                    checkPageBreak(LINE_HEIGHT_BODY * 2 + PARAGRAPH_SPACING); 
                    doc.setFont('times', 'bold');
                    doc.text(exp.role || '', margin, y);
                    doc.setFont('times', 'normal');
                    doc.text(dates, pageWidth - margin, y, { align: 'right' });
                    y += LINE_HEIGHT_BODY;

                    // Company & Location
                    doc.setFont('times', 'italic');
                    doc.text(exp.company || '', margin, y);
                    doc.setFont('times', 'normal');
                    doc.text(exp.location || '', pageWidth - margin, y, { align: 'right' });
                    y += LINE_HEIGHT_BODY;

                    // Bullets
                    if (exp.bullets) {
                         const bullets = exp.bullets.split('\n').map(b => b.trim().replace(/^•\s*/, '')).filter(Boolean);
                         bullets.forEach(b => {
                             const bLines = doc.splitTextToSize(b, contentWidth - 5);
                             checkPageBreak(bLines.length * LINE_HEIGHT_BODY);
                             doc.text('•', margin + 2, y);
                             doc.text(bLines, margin + 5, y);
                             y += bLines.length * LINE_HEIGHT_BODY;
                         });
                    }
                    y += PARAGRAPH_SPACING;

                } else if (item.type === 'education-item') {
                     const edu = item.data;
                     const dates = [edu.startDate, edu.endDate].filter(Boolean).join(' – ');
                     const degreeLine = [edu.degree, edu.minor].filter(Boolean).join(', ');

                     checkPageBreak(LINE_HEIGHT_BODY * 2 + PARAGRAPH_SPACING);
                     doc.setFont('times', 'bold');
                     doc.text(edu.school || '', margin, y);
                     doc.setFont('times', 'normal');
                     doc.text(dates, pageWidth - margin, y, { align: 'right' });
                     y += LINE_HEIGHT_BODY;

                     doc.setFont('times', 'italic');
                     doc.text(degreeLine + (edu.gpa ? ` | GPA: ${edu.gpa}` : ''), margin, y);
                     doc.setFont('times', 'normal');
                     doc.text(edu.location || '', pageWidth - margin, y, { align: 'right' });
                     y += LINE_HEIGHT_BODY;

                     if (edu.bullets) {
                         const bullets = edu.bullets.split('\n').map(b => b.trim().replace(/^•\s*/, '')).filter(Boolean);
                         bullets.forEach(b => {
                             const bLines = doc.splitTextToSize(b, contentWidth - 5);
                             checkPageBreak(bLines.length * LINE_HEIGHT_BODY);
                             doc.text('•', margin + 2, y);
                             doc.text(bLines, margin + 5, y);
                             y += bLines.length * LINE_HEIGHT_BODY;
                         });
                     }
                     y += PARAGRAPH_SPACING;

                } else if (['projects-item', 'cert-item', 'award-item'].includes(item.type)) {
                     const data = item.data;
                     const name = data.name + (data.organization ? `, ${data.organization}` : '');
                     const desc = data.relevance || '';

                     checkPageBreak(LINE_HEIGHT_BODY + PARAGRAPH_SPACING);
                     doc.setFont('times', 'bold');
                     doc.text(name, margin, y);
                     doc.setFont('times', 'normal');
                     doc.text(data.date || '', pageWidth - margin, y, { align: 'right' });
                     y += LINE_HEIGHT_BODY;

                     if (desc) {
                         const bullets = desc.split('\n').map(b => b.trim().replace(/^•\s*/, '')).filter(Boolean);
                         bullets.forEach(b => {
                             const bLines = doc.splitTextToSize(b, contentWidth - 5);
                             checkPageBreak(bLines.length * LINE_HEIGHT_BODY);
                             doc.text('•', margin + 2, y);
                             doc.text(bLines, margin + 5, y);
                             y += bLines.length * LINE_HEIGHT_BODY;
                         });
                     }
                     y += PARAGRAPH_SPACING;
                }
            }
        });
        
        doc.save(`${(contact.fullName || 'Resume').replace(/\s/g, '_')}.pdf`);
    };

    // --- 6. Render Helper ---
    const renderGranularItem = (section) => {
        if (!section) return null;
        if (section.type === 'header') return <h2 className="text-sm font-bold uppercase tracking-widest text-gray-800 border-b border-black pb-1 mb-2 mt-4">{section.title}</h2>;
        
        const itemClass = "mb-2"; 

        if (section.type === 'experience-item') {
            const exp = section.data;
            return (
                <div className={itemClass}>
                    <div className="flex justify-between items-baseline">
                        <h3 className="text-sm font-bold text-gray-900">{exp.role}</h3>
                        <p className="text-xs font-normal text-gray-700">{exp.startDate}{exp.endDate ? ` – ${exp.endDate}` : ''}</p>
                    </div>
                    <div className="flex justify-between items-baseline">
                        <p className="text-xs italic text-gray-800">{exp.company}</p>
                        <p className="text-xs font-normal text-gray-700">{exp.location}</p>
                    </div>
                    <ul className="mt-1 text-xs text-gray-800 list-disc pl-5 space-y-1 leading-normal">
                        {(exp.bullets || '').split('\n').map((line, i) => {
                            const c = line.trim().replace(/^•\s*/, '');
                            return c && <li key={i}>{c}</li>;
                        })}
                    </ul>
                </div>
            );
        }
        
        if (section.type === 'education-item') {
            const edu = section.data;
            return (
                <div className={itemClass}>
                    <div className="flex justify-between items-baseline">
                        <h3 className="text-sm font-bold text-gray-900">{edu.school}</h3>
                        <p className="text-xs font-normal text-gray-700">{edu.startDate}{edu.endDate ? ` – ${edu.endDate}` : ''}</p>
                    </div>
                    <div className="flex justify-between items-baseline">
                        <p className="text-xs italic text-gray-800">{edu.degree}{edu.minor ? `, ${edu.minor}` : ''}</p>
                        <p className="text-xs font-normal text-gray-700">{edu.location}</p>
                    </div>
                    {edu.bullets && (
                         <ul className="mt-1 text-xs text-gray-800 list-disc pl-5 space-y-1 leading-normal">
                            {edu.bullets.split('\n').map((line, i) => {
                                const c = line.trim().replace(/^•\s*/, '');
                                return c && <li key={i}>{c}</li>;
                            })}
                        </ul>
                    )}
                </div>
            );
        }

        if (section.type === 'projects-item' || section.type === 'cert-item' || section.type === 'award-item') {
            const item = section.data;
            const desc = item.relevance || ''; 
            return (
                 <div className={itemClass}>
                    <div className="flex justify-between items-baseline">
                        <h3 className="text-xs font-bold text-gray-900">{item.name}{item.organization ? `, ${item.organization}` : ''}</h3>
                        {item.date && <p className="text-xs font-normal text-gray-700">{item.date}</p>}
                    </div>
                     <ul className="mt-1 text-xs text-gray-800 list-disc pl-5 space-y-1 leading-normal">
                        {desc.split('\n').map((line, i) => {
                            const c = line.trim().replace(/^•\s*/, '');
                            return c && <li key={i}>{c}</li>;
                        })}
                    </ul>
                </div>
            );
        }
        
        if (section.type === 'summary-content') return <p className="text-sm text-gray-800 leading-normal whitespace-pre-wrap">{section.content}</p>;
        
        if (section.type === 'skills-content') {
            return (
                <ul className="text-xs text-gray-800 list-disc pl-5 space-y-1 leading-normal break-words whitespace-pre-wrap">
                    {section.content.split('\n').map((line, i) => {
                        const c = line.trim().replace(/^•\s*/, '');
                        return c && <li key={i}>{c}</li>;
                    })}
                </ul>
            );
        }
        return null;
    };

    return (
        <div className="text-white min-h-screen p-4 sm:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                    <button onClick={() => navigate(`/resume/${resumeId}/contact`)} className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg">
                        Back to Editor
                    </button>
                    <button onClick={handleDownloadPDF} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg">
                        DOWNLOAD PDF
                    </button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
                    {/* --- PREVIEW AREA --- */}
                    <div className="lg:col-span-2 bg-gray-200 p-4 sm:p-8 rounded-lg flex flex-col items-center overflow-x-auto">
                        {paginatedContent.map((pageSections, pageIndex) => (
                            <ResumePage key={pageIndex} pageNumber={pageIndex + 1} totalPages={paginatedContent.length} height={`${PAGE_HEIGHT_PX / 96}in`}>
                                {pageIndex === 0 && (
                                    <header className="text-center mb-6">
                                        <h1 className="text-xl font-bold tracking-wider text-gray-900">{contact.fullName || "Your Name"}</h1>
                                        <div className="text-xs text-gray-700 mt-2">
                                            <p>{[
                                                contactToggles.city && contact.city, 
                                                contactToggles.state && contact.state, 
                                                contactToggles.country && contact.country
                                            ].filter(Boolean).join(', ') + ' | ' + contact.email + (contactToggles.phone ? ' | ' + contact.phone : '')}</p>
                                        </div>
                                    </header>
                                )}
                                <main>
                                    {pageSections.map((section, idx) => (
                                        <DraggablePreviewItem 
                                            key={`${section.id}-${idx}`}
                                            id={section.id} 
                                            dataId={section.dataId}
                                            type={section.type}
                                            sectionId={section.sectionId}
                                            index={idx}
                                            // Enable drag for Headers AND Items
                                            disabled={section.type.includes('content')}
                                        >
                                            {renderGranularItem(section)}
                                        </DraggablePreviewItem>
                                    ))}
                                </main>
                            </ResumePage>
                        ))}
                    </div>
                    
                    <div className="lg:col-span-1 space-y-8">
                        <AIKeywordAnalysis />
                    </div>
                </div>

                {/* --- HIDDEN CALCULATION AREA --- */}
                <div ref={hiddenPreviewRef} style={{ position: 'absolute', left: '-9999px', top: 0, opacity: 0, width: '8.5in' }}>
                     <div className="bg-white text-black font-serif" style={{ width: '8.5in', minHeight: '11in', padding: '1in' }}>
                        <header className="text-center mb-6">
                            <h1 className="text-2xl font-bold tracking-wider text-gray-900">{contact.fullName || "Your Name"}</h1>
                        </header>
                        <main>
                            {orderedSections.map((section, index) => (
                                <div key={index} className="granular-item">
                                    {renderGranularItem(section)}
                                </div>
                            ))}
                        </main>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinalResumePage;