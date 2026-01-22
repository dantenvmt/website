import React, { createContext, useState, useContext, useCallback, useMemo } from 'react';

const ResumeContext = createContext();

export const useResume = () => useContext(ResumeContext);

// Initial state definitions
const initialContact = {
    fullName: '', email: '', phone: '', linkedin: '', website: '',
    city: '', state: '', country: '',
};
const initialContactToggles = {
    phone: true, linkedin: true, city: true, state: true, country: true,
};
const initialExperiences = () => ([
    { id: Date.now(), role: '', company: '', startDate: '', endDate: '', isCurrent: false, location: '', bullets: '• ', aiUsesLeft: 3 }
]);
const initialEducations = () => ([
    { id: Date.now(), degree: '', school: '', startDate: '', endDate: '', location: '', bullets: '• ', minor: '', gpa: '' }
]);
const initialAwards = () => ([
    { id: Date.now(), name: '', organization: '', date: '', relevance: '' }
]);
const initialCertifications = () => ([
    { id: Date.now(), name: '', organization: '', date: '', relevance: '' }
]);
const initialProjects = () => ([
    { id: Date.now(), name: '', date: '', relevance: '' }
]);

export const ResumeProvider = ({ children }) => {
    const [contact, setContactState] = useState(initialContact);
    const [contactToggles, setContactToggles] = useState(initialContactToggles);
    const [summary, setSummaryState] = useState('');
    const [skills, setSkillsState] = useState('');
    const [experiences, setExperiencesState] = useState(initialExperiences);
    const [educations, setEducationsState] = useState(initialEducations);
    const [awards, setAwardsState] = useState(initialAwards);
    const [certifications, setCertificationsState] = useState(initialCertifications);
    const [projects, setProjectsState] = useState(initialProjects);
    const [jobDescription, setJobDescription] = useState('');
    const [aiAnalysis, setAiAnalysis] = useState(null);

    const mapAndSetData = useCallback((setter) => (data) => {
        if (Array.isArray(data)) {
            const mappedData = data.map(item => ({
                ...item,
                startDate: item.start_date || item.startDate,
                endDate: item.end_date || item.endDate,
                relevance: item.award_description || item.certification_description || item.project_description || item.relevance,
                bullets: item.experience_description || item.education_description || item.bullets,
                id: item.award_id || item.certification_id || item.project_id || item.experience_id || item.education_id || item.id,
            }));
            if (mappedData.length > 0) {
                setter(mappedData);
            } else {
                if (setter === setExperiencesState) setter(initialExperiences());
                else if (setter === setEducationsState) setter(initialEducations());
                else if (setter === setAwardsState) setter(initialAwards());
                else if (setter === setCertificationsState) setter(initialCertifications());
                else if (setter === setProjectsState) setter(initialProjects());
            }
        } else {
            setter(data);
        }
    }, []);

    const setContact = useMemo(() => mapAndSetData(setContactState), [mapAndSetData]);
    const setSummary = useMemo(() => setSummaryState, []);
    const setSkills = useMemo(() => setSkillsState, []);
    const setExperiences = useMemo(() => mapAndSetData(setExperiencesState), [mapAndSetData]);
    const setEducations = useMemo(() => mapAndSetData(setEducationsState), [mapAndSetData]);
    const setAwards = useMemo(() => mapAndSetData(setAwardsState), [mapAndSetData]);
    const setCertifications = useMemo(() => mapAndSetData(setCertificationsState), [mapAndSetData]);
    const setProjects = useMemo(() => mapAndSetData(setProjectsState), [mapAndSetData]);

    const addExperience = useCallback(() => setExperiencesState(prev => [...prev, { id: Date.now(), role: '', company: '', startDate: '', endDate: '', isCurrent: false, location: '', bullets: '• ', aiUsesLeft: 3 }]), []);
    const addEducation = useCallback(() => setEducationsState(prev => [...prev, { id: Date.now(), degree: '', school: '', startDate: '', endDate: '', location: '', bullets: '• ', minor: '', gpa: '' }]), []);
    const addAward = useCallback(() => setAwardsState(prev => [...prev, { id: Date.now(), name: '', organization: '', date: '', relevance: '' }]), []);
    const addCertificate = useCallback(() => setCertificationsState(prev => [...prev, { id: Date.now(), name: '', organization: '', date: '', relevance: '' }]), []);
    const addProject = useCallback(() => setProjectsState(prev => [...prev, { id: Date.now(), name: '', date: '', relevance: '' }]), []);

    const resetResume = useCallback(() => {
        setContactState(initialContact);
        setContactToggles(initialContactToggles);
        setSummaryState('');
        setSkillsState('');
        setExperiencesState(initialExperiences());
        setEducationsState(initialEducations());
        setAwardsState(initialAwards());
        setCertificationsState(initialCertifications());
        setProjectsState(initialProjects());
        setJobDescription('');
        setAiAnalysis(null);
    }, []);

    // --- NEW FUNCTION: reorderSection ---
    // This allows you to swap items in any list (experience, projects, etc.)
    const reorderSection = useCallback((sectionKey, startIndex, endIndex) => {
        let setter;
        let currentList;

        // Determine which state to update
        switch (sectionKey) {
            case 'experience':
                setter = setExperiencesState;
                currentList = experiences;
                break;
            case 'projects':
                setter = setProjectsState;
                currentList = projects;
                break;
                case 'education':
                setter = setEducationsState;
                currentList = educations;
                break;
            case 'certifications':
                setter = setCertificationsState;
                currentList = certifications;
                break;
            case 'awards':
                setter = setAwardsState;
                currentList = awards;
                break;
            // Add other cases if you want to reorder other sections later
            default:
                return;
        }

        if (!currentList || !setter) return;

        const result = Array.from(currentList);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);
        setter(result);
    }, [experiences, projects, educations, certifications, awards]);

    const value = useMemo(() => ({
        contact, setContact,
        contactToggles, setContactToggles,
        summary, setSummary,
        skills, setSkills,
        experiences, setExperiences,
        educations, setEducations,
        awards, setAwards,
        certifications, setCertifications,
        projects, setProjects,
        jobDescription, setJobDescription,
        aiAnalysis, setAiAnalysis,
        resetResume, addExperience, addEducation, addAward, addCertificate, addProject,
        // Export the new function
        reorderSection, 
        
        initialContact,
        initialExperiences,
        initialEducations,
        initialAwards,
        initialCertifications,
        initialProjects

    }), [
        contact, contactToggles, summary, skills, experiences, educations, awards, certifications, projects, jobDescription, aiAnalysis,
        setContact, setSummary, setSkills, setExperiences, setEducations, setAwards, setCertifications, setProjects,
        resetResume, addExperience, addEducation, addAward, addCertificate, addProject,
        reorderSection // Add to dependency array
    ]);

    return (
        <ResumeContext.Provider value={value}>
            {children}
        </ResumeContext.Provider>
    );
};