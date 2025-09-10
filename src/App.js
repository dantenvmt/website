import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

import MainLayout from './components/layout/MainLayout';
import { ResumeProvider } from './context/ResumeContext';
// --- Page Components ---
import HomePage from './pages/HomePage';
import GenericPage from './pages/GenericPage';
import ResearchPage from './pages/research/ResearchPage';
import AboutPage from './pages/company/AboutPage';
import CareersPage from './pages/company/CareersPage';
import CareerSearchPage from './pages/company/careers/CareerSearchPage';
import JobDescriptionPage from './pages/company/careers/JobDescriptionPage';
import ContactPage from './pages/company/ContactPage';
import ApplyPage from './pages/company/careers/ApplyPage';
import ResumeDashboardPage from './pages/resume/ResumeDashboardPage';
import Contact from './pages/resume/contact';
import Experience from './pages/resume/experience';
import Education from './pages/resume/education';
import Skills from './pages/resume/skills';
import Awards from './pages/resume/awards';
import Certificates from './pages/resume/certifications';
import Summary from './pages/resume/summary';
import FinalResumePage from './pages/resume/FinalResumePage';



const ResumeRoutes = () => (
  <ResumeProvider>
    <Routes>
      <Route index element={<ResumeDashboardPage />} />
      <Route path="contact" element={<Contact />} />
      <Route path="experience" element={<Experience />} />
      <Route path="education" element={<Education />} />
      <Route path="skills" element={<Skills />} />
      <Route path="awards" element={<Awards />} />
      <Route path="certifications" element={<Certificates />} />
      <Route path="summary" element={<Summary />} />
      <Route path="final" element={<FinalResumePage />} />
    </Routes>
  </ResumeProvider>
);
export default function App() {
  return (
    <Routes>

      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="research" element={<Navigate to="/research/index" replace />} />
        <Route path="research/index" element={<ResearchPage />} />
        <Route path="research/overview" element={<GenericPage title="Research Overview" />} />
        <Route path="research/residency" element={<GenericPage title="Research Residency" />} />

        <Route path="company" element={<Navigate to="/company/about-us" replace />} />
        <Route path="company/about-us" element={<AboutPage />} />
        <Route path="company/careers" element={<CareersPage />} />
        <Route path="company/careers/search" element={<CareerSearchPage />} />
        <Route path="company/contact" element={<ContactPage />} />
        <Route path="company/terms-and-privacy" element={<GenericPage title="Terms & Privacy" />} />

        <Route path="company/careers/jobs/:jobId" element={<JobDescriptionPage />} />
        <Route path="company/careers/jobs/:jobId/apply" element={<ApplyPage />} />

        <Route path="resume/*" element={<ResumeRoutes />} />
      </Route>
    </Routes>
  );
}
