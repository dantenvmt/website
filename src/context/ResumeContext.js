import React, { createContext, useState, useContext } from 'react';

const ResumeContext = createContext();

export const useResume = () => useContext(ResumeContext);

// Define initial states to easily reset them
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


export const ResumeProvider = ({ children }) => {
    // --- STATE FOR ALL RESUME SECTIONS ---
    const [contact, setContact] = useState(initialContact);
    const [contactToggles, setContactToggles] = useState(initialContactToggles);
    const [summary, setSummary] = useState('');
    const [skills, setSkills] = useState('');
    const [experiences, setExperiences] = useState(initialExperiences);
    const [educations, setEducations] = useState(initialEducations);
    const [awards, setAwards] = useState(initialAwards);
    const [certifications, setCertifications] = useState(initialCertifications);

    // --- NEW STATE FOR AI FEATURES ---
    const [jobDescription, setJobDescription] = useState('');
    const [aiAnalysis, setAiAnalysis] = useState(null); // To hold score, keywords, etc.

    // --- FUNCTIONS ---
    const addExperience = () => setExperiences(prev => [...prev, { id: Date.now(), role: '', company: '', startDate: '', endDate: '', isCurrent: false, location: '', bullets: '• ', aiUsesLeft: 3 }]);
    const addEducation = () => setEducations(prev => [...prev, { id: Date.now(), degree: '', school: '', startDate: '', endDate: '', location: '', bullets: '• ', minor: '', gpa: '' }]);
    const addAward = () => setAwards(prev => [...prev, { id: Date.now(), name: '', organization: '', date: '', relevance: '' }]);
    const addCertificate = () => setCertifications(prev => [...prev, { id: Date.now(), name: '', organization: '', date: '', relevance: '' }]);

    // --- NEW RESET FUNCTION ---
    const resetResume = () => {
        setContact(initialContact);
        setContactToggles(initialContactToggles);
        setSummary('');
        setSkills('');
        setExperiences(initialExperiences());
        setEducations(initialEducations());
        setAwards(initialAwards());
        setCertifications(initialCertifications());
        setJobDescription('');
        setAiAnalysis(null);
    };

    const value = {
        contact, setContact,
        contactToggles, setContactToggles,
        summary, setSummary,
        skills, setSkills,
        experiences, setExperiences, addExperience,
        educations, setEducations, addEducation,
        awards, setAwards, addAward,
        certifications, setCertifications, addCertificate,
        jobDescription, setJobDescription,
        aiAnalysis, setAiAnalysis,
        resetResume, // Expose the reset function
    };

    return (
        <ResumeContext.Provider value={value}>
            {children}
        </ResumeContext.Provider>
    );
};