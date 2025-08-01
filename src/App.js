import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

import MainLayout from './components/layout/MainLayout';

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

        <Route path="resume_optimization" element={<GenericPage title="Resume Optimization" />} />
        <Route path="job_board" element={<GenericPage title="Job Board" />} />
        <Route path="faq" element={<GenericPage title="FAQ" />} />
      </Route>
    </Routes>
  );
}
