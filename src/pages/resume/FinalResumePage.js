import React, { useRef, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useResume } from '../../context/ResumeContext';
import jsPDF from 'jspdf';
import AIKeywordAnalysis from '../../components/resume/AIKeywordAnalysis';
import { useAuth } from '../../context/AuthContext';
import LoginModal from '../../components/auth/LoginModal'; //
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
import html2canvas from 'html2canvas';
import { softBreakLongTokens } from '../../utils/resumeTextCleaner';
import { registerSourceSerif, SOURCE_SERIF_FONT_NAME } from '../../utils/sourceSerifFont';
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
    const { user } = useAuth(); // Access user state
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState(null);
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
            fetch(`https://renaisons.com/api/get_resume_details.php?resume_id=${resumeId}`, {
                credentials: 'include'
            })
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
    // --- Generate and Save Screenshot ---
    useEffect(() => {
        // Wait a brief moment for the DOM and fonts to fully render
        const timer = setTimeout(async () => {
            if (hiddenPreviewRef.current && orderedSections.length > 0) {
                try {
                    // Take a screenshot of the hidden preview div
                    const canvas = await html2canvas(hiddenPreviewRef.current, {
                        scale: 0.5, // Scale down to save database space/bandwidth
                        useCORS: true,
                        logging: false
                    });

                    // Convert canvas to a Base64 JPEG string
                    const base64Image = canvas.toDataURL('image/jpeg', 0.7);

                    // TODO: Send this to your backend to save it

                    await fetch('https://renaisons.com/api/save_thumbnail.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({
                            resume_id: resumeId,
                            thumbnail: base64Image
                        })
                    });

                } catch (error) {
                }
            }
        }, 2000); // 2 second delay to ensure everything is loaded

        return () => clearTimeout(timer);
    }, [orderedSections, contact]); // Re-run if the resume content changes
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
                    // FIX: Filter out experiences with no Role
                    const validExperience = experiences?.filter(e => e.role && e.role.trim() !== '');
                    if (validExperience?.length) {
                        granular.push({ id: 'experience-header', type: 'header', title: 'Experience', sectionId: 'experience' });
                        validExperience.forEach(exp => granular.push({ id: `exp-${exp.id}`, dataId: exp.id, type: 'experience-item', data: exp }));
                    }
                    break;

                case 'education':
                    // FIX: Filter out education with no School Name
                    const validEducation = educations?.filter(e => e.school && e.school.trim() !== '');
                    if (validEducation?.length) {
                        granular.push({ id: 'education-header', type: 'header', title: 'Education', sectionId: 'education' });
                        validEducation.forEach(edu => granular.push({ id: `edu-${edu.id}`, dataId: edu.id, type: 'education-item', data: edu }));
                    }
                    break;

                case 'projects':
                    // FIX: Filter out projects with no Project Name
                    const validProjects = projects?.filter(p => p.name && p.name.trim() !== '');
                    if (validProjects?.length) {
                        granular.push({ id: 'projects-header', type: 'header', title: 'Projects', sectionId: 'projects' });
                        validProjects.forEach(proj => granular.push({ id: `proj-${proj.id}`, dataId: proj.id, type: 'projects-item', data: proj }));
                    }
                    break;

                case 'certifications':
                    // FIX: Filter out certifications with no Name
                    const validCerts = certifications?.filter(c => c.name && c.name.trim() !== '');
                    if (validCerts?.length) {
                        granular.push({ id: 'certifications-header', type: 'header', title: 'Certifications', sectionId: 'certifications' });
                        validCerts.forEach(cert => granular.push({ id: `cert-${cert.id}`, dataId: cert.id, type: 'cert-item', data: cert }));
                    }
                    break;

                case 'awards':
                    // FIX: Filter out awards with no Award Name
                    const validAwards = awards?.filter(a => a.name && a.name.trim() !== '');
                    if (validAwards?.length) {
                        granular.push({ id: 'awards-header', type: 'header', title: 'Awards', sectionId: 'awards' });
                        validAwards.forEach(award => granular.push({ id: `award-${award.id}`, dataId: award.id, type: 'award-item', data: award }));
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
            const USABLE_HEIGHT = PAGE_HEIGHT_PX - PAGE_MARGIN * 2;

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
    const handleBackToEditor = () => {
        if (!user) {
            setPendingAction('back');
            setIsLoginModalOpen(true);
            return;
        }
        navigate(`/resume/${resumeId}/contact`);
    };
    const handleDownloadPDF = () => {
        if (!user) {
            setPendingAction('download');
            setIsLoginModalOpen(true);
            return;
        }
        const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'letter' });
        registerSourceSerif(doc);
        doc.setFont(SOURCE_SERIF_FONT_NAME);

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 24;
        const contentWidth = pageWidth - margin * 2;
        let y = margin;

        const FONT_SIZE_BODY = 8;
        const FONT_SIZE_HEADER = 10;
        const FONT_SIZE_NAME = 14;
        const FONT_SIZE_CONTACT = 8;
        // Tailwind's leading-normal is ~1.5. Preview text-xs (12px) at that
        // leading gives ~4.76mm/line; 1.35 gets us close without wasting space.
        const LINE_SPACING = 1.35;
        // Trailing gap after each content block — matches the preview's mb-2 (~2.1mm).
        const PARAGRAPH_SPACING = 2;
        // Additional gap placed before each section header — matches the
        // preview's mt-4 (~4.2mm). This is the main source of the roomy feel.
        const SECTION_HEADER_TOP_GAP = 4;

        const LINE_HEIGHT_BODY = FONT_SIZE_BODY * 0.3528 * LINE_SPACING;
        const LINE_HEIGHT_HEADER = FONT_SIZE_HEADER * 0.3528 * LINE_SPACING;

        const checkPageBreak = (neededHeight) => {
            if (y + neededHeight > pageHeight - margin) {
                doc.addPage();
                y = margin;
            }
        };

        // jsPDF's splitTextToSize only breaks on whitespace. If a single token
        // (long URL, email, unbroken concatenation) is wider than the line,
        // it overflows the margin. Pre-break such tokens at ~60 characters so
        // splitTextToSize has a break opportunity to land on.
        const splitSafe = (text, width) => {
            const prepared = softBreakLongTokens(text || '', 60, ' ');
            return doc.splitTextToSize(prepared, width);
        };

        // --- PDF Header ---
        doc.setFont(SOURCE_SERIF_FONT_NAME, 'bold');
        doc.setFontSize(FONT_SIZE_NAME);
        // Match the preview's tracking-wider (~0.05em) — a light touch, not 0.4mm.
        doc.setCharSpace(0.15);
        doc.text(contact.fullName || "Your Name", pageWidth / 2, y, { align: 'center' });
        doc.setCharSpace(0);
        // Tight gap below name baseline to next line.
        y += FONT_SIZE_NAME * 0.3528 + 1;

        doc.setFont(SOURCE_SERIF_FONT_NAME, 'normal');
        doc.setFontSize(FONT_SIZE_CONTACT);

        const locationString = [contactToggles.city && contact.city, contactToggles.state && contact.state, contactToggles.country && contact.country].filter(Boolean).join(', ');
        const contactLine = [
            locationString,
            contact.email,
            contactToggles.phone ? contact.phone : '',
            (contactToggles.linkedin && contact.linkedin) ? `linkedin.com/in/${contact.linkedin}` : ''
        ].filter(Boolean).join('  |  ');

        doc.text(contactLine, pageWidth / 2, y, { align: 'center' });
        y += 6; // Spacing after contact info (was 8)

        // --- Loop through GRANULAR items for PDF ---
        orderedSections.forEach((item, itemIdx) => {
            if (item.type === 'header') {
                // Estimate the height needed for the header AND the first
                // content item below it, so the header doesn't orphan at
                // the bottom of a page. We look ahead at the next item.
                const nextItem = orderedSections[itemIdx + 1];
                let firstContentHeight = LINE_HEIGHT_BODY * 2;
                if (nextItem) {
                    if (nextItem.type === 'experience-item' || nextItem.type === 'education-item') {
                        firstContentHeight = LINE_HEIGHT_BODY * 3; // two header lines + first bullet
                    } else if (nextItem.type === 'skills-content') {
                        // first line of skills
                        firstContentHeight = LINE_HEIGHT_BODY * 2;
                    }
                }
                checkPageBreak(LINE_HEIGHT_HEADER + 5 + firstContentHeight);

                // Preview uses mt-4 (~4.2mm) above each section header.
                y += SECTION_HEADER_TOP_GAP;
                doc.setFont(SOURCE_SERIF_FONT_NAME, 'bold');
                doc.setFontSize(FONT_SIZE_HEADER);
                // Subtle tracking for the uppercase look, not stretched.
                doc.setCharSpace(0.15);
                doc.text(item.title.toUpperCase(), margin, y);
                doc.setCharSpace(0);
                // Clear the header text's descenders before drawing the underline,
                // otherwise the line visually fuses with the letters.
                y += 2.5;
                // Match the preview's border-b border-black.
                doc.setLineWidth(0.3);
                doc.setDrawColor(0, 0, 0);
                doc.line(margin, y, pageWidth - margin, y);
                // Leave enough room for the next body line's ascender so the text
                // doesn't sit right on top of the rule.
                y += 5;
            } else {
                // Content Items
                doc.setFont(SOURCE_SERIF_FONT_NAME, 'normal');
                doc.setFontSize(FONT_SIZE_BODY);

                if (item.type === 'summary-content') {
                    // Preserve explicit line breaks in the summary text
                    // (whitespace-pre-wrap in the preview).
                    const paragraphs = (item.content || '').split('\n');
                    paragraphs.forEach(p => {
                        if (!p.trim()) {
                            y += LINE_HEIGHT_BODY * 0.5;
                            return;
                        }
                        const lines = splitSafe(p, contentWidth);
                        checkPageBreak(lines.length * LINE_HEIGHT_BODY);
                        doc.text(lines, margin, y);
                        y += lines.length * LINE_HEIGHT_BODY;
                    });
                    y += PARAGRAPH_SPACING;

                } else if (item.type === 'skills-content') {
                    // Preview renders skills as a <ul> with one bullet per line.
                    // Match that in PDF instead of flattening to a paragraph.
                    const bullets = (item.content || '')
                        .split('\n')
                        .map(b => b.trim().replace(/^•\s*/, ''))
                        .filter(Boolean);
                    bullets.forEach(b => {
                        const bLines = splitSafe(b, contentWidth - 5);
                        checkPageBreak(bLines.length * LINE_HEIGHT_BODY);
                        doc.text('•', margin + 2, y);
                        doc.text(bLines, margin + 5, y);
                        y += bLines.length * LINE_HEIGHT_BODY;
                    });
                    y += PARAGRAPH_SPACING;

                } else if (item.type === 'experience-item') {
                    const exp = item.data;
                    const dates = [exp.startDate, exp.endDate].filter(Boolean).join(' – ');

                    // Keep role + company + first bullet together across a page break
                    // so the title never orphans above its bullets.
                    checkPageBreak(LINE_HEIGHT_BODY * 3 + PARAGRAPH_SPACING);
                    doc.setFont(SOURCE_SERIF_FONT_NAME, 'bold');
                    doc.text(softBreakLongTokens(exp.role || '', 60), margin, y);
                    doc.setFont(SOURCE_SERIF_FONT_NAME, 'normal');
                    doc.text(dates, pageWidth - margin, y, { align: 'right' });
                    y += LINE_HEIGHT_BODY;

                    // Company & Location
                    doc.setFont(SOURCE_SERIF_FONT_NAME, 'italic');
                    doc.text(softBreakLongTokens(exp.company || '', 60), margin, y);
                    doc.setFont(SOURCE_SERIF_FONT_NAME, 'normal');
                    doc.text(softBreakLongTokens(exp.location || '', 60), pageWidth - margin, y, { align: 'right' });
                    y += LINE_HEIGHT_BODY;

                    // Bullets
                    if (exp.bullets) {
                        const bullets = exp.bullets.split('\n').map(b => b.trim().replace(/^•\s*/, '')).filter(Boolean);
                        bullets.forEach(b => {
                            const bLines = splitSafe(b, contentWidth - 5);
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

                    checkPageBreak(LINE_HEIGHT_BODY * 3 + PARAGRAPH_SPACING);
                    doc.setFont(SOURCE_SERIF_FONT_NAME, 'bold');
                    doc.text(softBreakLongTokens(edu.school || '', 60), margin, y);
                    doc.setFont(SOURCE_SERIF_FONT_NAME, 'normal');
                    doc.text(dates, pageWidth - margin, y, { align: 'right' });
                    y += LINE_HEIGHT_BODY;

                    doc.setFont(SOURCE_SERIF_FONT_NAME, 'italic');
                    doc.text(softBreakLongTokens(degreeLine + (edu.gpa ? ` | GPA: ${edu.gpa}` : ''), 60), margin, y);
                    doc.setFont(SOURCE_SERIF_FONT_NAME, 'normal');
                    doc.text(softBreakLongTokens(edu.location || '', 60), pageWidth - margin, y, { align: 'right' });
                    y += LINE_HEIGHT_BODY;

                    if (edu.bullets) {
                        const bullets = edu.bullets.split('\n').map(b => b.trim().replace(/^•\s*/, '')).filter(Boolean);
                        bullets.forEach(b => {
                            const bLines = splitSafe(b, contentWidth - 5);
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

                    checkPageBreak(LINE_HEIGHT_BODY * 2 + PARAGRAPH_SPACING);
                    doc.setFont(SOURCE_SERIF_FONT_NAME, 'bold');
                    doc.text(softBreakLongTokens(name, 60), margin, y);
                    doc.setFont(SOURCE_SERIF_FONT_NAME, 'normal');
                    doc.text(data.date || '', pageWidth - margin, y, { align: 'right' });
                    y += LINE_HEIGHT_BODY;

                    if (desc) {
                        const bullets = desc.split('\n').map(b => b.trim().replace(/^•\s*/, '')).filter(Boolean);
                        bullets.forEach(b => {
                            const bLines = splitSafe(b, contentWidth - 5);
                            checkPageBreak(bLines.length * LINE_HEIGHT_BODY);
                            doc.text('•', margin + 2, y);
                            doc.text(bLines, margin + 5, y);
                            y += bLines.length * LINE_HEIGHT_BODY;
                        });
                        y += PARAGRAPH_SPACING;
                    } else {
                        // Single-line item (e.g. a cert with no description) —
                        // use a tight gap so cert lists don't feel sparse.
                        y += 1;
                    }
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
                    <div className="flex justify-between items-baseline gap-2">
                        <h3 className="text-sm font-bold text-gray-900 break-words min-w-0">{exp.role}</h3>
                        <p className="text-xs font-normal text-gray-700 flex-shrink-0 whitespace-nowrap">{exp.startDate}{exp.endDate ? ` – ${exp.endDate}` : ''}</p>
                    </div>
                    <div className="flex justify-between items-baseline gap-2">
                        <p className="text-xs italic text-gray-800 break-words min-w-0">{exp.company}</p>
                        <p className="text-xs font-normal text-gray-700 flex-shrink-0">{exp.location}</p>
                    </div>
                    <ul className="mt-1 text-xs text-gray-800 list-disc pl-5 space-y-1 leading-normal break-words">
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
                    <div className="flex justify-between items-baseline gap-2">
                        <h3 className="text-sm font-bold text-gray-900 break-words min-w-0">{edu.school}</h3>
                        <p className="text-xs font-normal text-gray-700 flex-shrink-0 whitespace-nowrap">{edu.startDate}{edu.endDate ? ` – ${edu.endDate}` : ''}</p>
                    </div>
                    <div className="flex justify-between items-baseline gap-2">
                        <p className="text-xs italic text-gray-800 break-words min-w-0">{edu.degree}{edu.minor ? `, ${edu.minor}` : ''}</p>
                        <p className="text-xs font-normal text-gray-700 flex-shrink-0">{edu.location}</p>
                    </div>
                    {edu.bullets && (
                        <ul className="mt-1 text-xs text-gray-800 list-disc pl-5 space-y-1 leading-normal break-words">
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
                    <div className="flex justify-between items-baseline gap-2">
                        <h3 className="text-xs font-bold text-gray-900 break-words min-w-0">{item.name}{item.organization ? `, ${item.organization}` : ''}</h3>
                        {item.date && <p className="text-xs font-normal text-gray-700 flex-shrink-0 whitespace-nowrap">{item.date}</p>}
                    </div>
                    <ul className="mt-1 text-xs text-gray-800 list-disc pl-5 space-y-1 leading-normal break-words">
                        {desc.split('\n').map((line, i) => {
                            const c = line.trim().replace(/^•\s*/, '');
                            return c && <li key={i}>{c}</li>;
                        })}
                    </ul>
                </div>
            );
        }

        if (section.type === 'summary-content') return <p className="text-xs text-gray-800 break-words leading-normal whitespace-pre-wrap">{section.content}</p>;

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
            {/* Login Modal Integration */}
            <LoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
                onLoginSuccess={() => {
                    setIsLoginModalOpen(false);
                    // Route to the correct action after logging in
                    if (pendingAction === 'download') {
                        handleDownloadPDF();
                    } else if (pendingAction === 'back') {
                        navigate(`/resume/${resumeId}/contact`);
                    }
                    setPendingAction(null); // reset
                }}
            />

            <div className="max-w-7xl mx-auto">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                    <button onClick={handleBackToEditor} className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg">
                        Back to Editor
                    </button>
                    {/* The button now triggers the auth check */}
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
                                                [
                                                    contactToggles.city && contact.city,
                                                    contactToggles.state && contact.state,
                                                    contactToggles.country && contact.country
                                                ].filter(Boolean).join(', '),
                                                contact.email,
                                                contactToggles.phone && contact.phone,
                                                contactToggles.linkedin && contact.linkedin && `linkedin.com/in/${contact.linkedin}`
                                            ].filter(Boolean).join('  |  ')}</p>
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
                <div ref={hiddenPreviewRef} style={{ position: 'absolute', left: '-9999px', top: '-9999px', width: '8.5in' }}>
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