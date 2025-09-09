import React, { createContext, useState, useContext } from 'react';

// Create the context
const ResumeContext = createContext();

// Custom hook to use the resume context easily
export const useResume = () => useContext(ResumeContext);

// The provider component that will wrap your app or resume section
export const ResumeProvider = ({ children }) => {
    // --- STATE FOR ALL RESUME SECTIONS ---

    const [contact, setContact] = useState({
        fullName: '',
        email: '',
        phone: '',
        linkedin: '',
        website: '',
        city: '',
        state: '',
        country: '',
    });

    const [contactToggles, setContactToggles] = useState({
        city: false,
        state: true,
        country: true,
    });

    // Summary
    const [summary, setSummary] = useState('');

    // Skills
    const [skills, setSkills] = useState('');

    // Experience (List)
    const [experiences, setExperiences] = useState([
        {
            id: Date.now(),
            role: '',
            company: '',
            startDate: '',
            endDate: '',
            isCurrent: false,
            location: '',
            bullets: '• ',
            aiUsesLeft: 3,
        }
    ]);

    // Education (List)
    const [educations, setEducations] = useState([
        {
            id: Date.now(),
            degree: '',
            school: '',
            startDate: '',
            endDate: '',
            location: '',
            bullets: '• ',
            minor: '',
            gpa: '',
        }
    ]);

    // Awards (List)
    const [awards, setAwards] = useState([
        {
            id: Date.now(),
            name: '',
            organization: '',
            date: '',
            relevance: '',
        }
    ]);

    // Certifications (List)
    const [certifications, setCertifications] = useState([
        {
            id: Date.now(),
            name: '',
            organization: '',
            date: '',
            relevance: '',
        }
    ]);

    // --- FUNCTIONS TO ADD NEW ITEMS TO LISTS ---

    const addExperience = () => {
        setExperiences(prev => [
            ...prev,
            {
                id: Date.now(),
                role: '',
                company: '',
                startDate: '',
                endDate: '',
                isCurrent: false,
                location: '',
                bullets: '• ',
                aiUsesLeft: 3,
            }
        ]);
    };

    const addEducation = () => {
        setEducations(prev => [
            ...prev,
            {
                id: Date.now(),
                degree: '',
                school: '',
                startDate: '',
                endDate: '',
                location: '',
                bullets: '• ',
                minor: '',
                gpa: '',
            }
        ]);
    };

    const addAward = () => {
        setAwards(prev => [
            ...prev,
            {
                id: Date.now(),
                name: '',
                organization: '',
                date: '',
                relevance: '',
            }
        ]);
    };

    const addCertificate = () => {
        setCertifications(prev => [
            ...prev,
            {
                id: Date.now(),
                name: '',
                organization: '',
                date: '',
                relevance: '',
            }
        ]);
    };


    // --- VALUE PROVIDED TO CHILDREN ---

    const value = {
        contact, setContact,
        contactToggles, setContactToggles,
        summary, setSummary,
        skills, setSkills,
        experiences, setExperiences, addExperience,
        educations, setEducations, addEducation,
        awards, setAwards, addAward,
        certifications, setCertifications, addCertificate,
    };

    return (
        <ResumeContext.Provider value={value}>
            {children}
        </ResumeContext.Provider>
    );
};

