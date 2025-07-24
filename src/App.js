import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// --- Layout Components ---
import MainLayout from './components/layout/MainLayout';
import AdminRoute from './components/layout/AdminRoute';

// --- Page Components ---
import HomePage from './pages/HomePage';
import GenericPage from './pages/GenericPage';
import ResearchPage from './pages/research/ResearchPage';
import AboutPage from './pages/company/AboutPage';
import CharterPage from './pages/company/CharterPage';
import CareersPage from './pages/company/CareersPage';
// ✅ FIX: Import from the correct /careers/ folder
import CareerSearchPage from './pages/company/careers/CareerSearchPage';
import JobPage from './pages/company/careers/JobPage';
import PlansPage from './pages/PlansPage';
import ContactPage from './pages/company/ContactPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminPage from './pages/AdminPage';

export default function App() {
  return (
    <Routes>
      <Route path="/admin" element={<AdminRoute />}>
        <Route index element={<AdminPage />} />
      </Route>

      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="research" element={<Navigate to="/research/index" replace />} />
        <Route path="research/index" element={<ResearchPage />} />
        <Route path="research/overview" element={<GenericPage title="Research Overview" />} />
        <Route path="research/residency" element={<GenericPage title="Research Residency" />} />
        {/* ✅ FIX: Corrected the route paths to use /careers/ */}
        <Route path="company" element={<Navigate to="/company/about-us" replace />} />
        <Route path="company/about-us" element={<AboutPage />} />
        <Route path="company/our-charter" element={<CharterPage />} />


        <Route path="company/careers" element={<CareersPage />} />
        <Route path="company/careers/search" element={<CareerSearchPage />} />
        <Route path="company/careers/jobs/:id" element={<JobPage />} />

        <Route path="company/contact" element={<ContactPage />} />
        <Route path="safety" element={<GenericPage title="Safety" />} />
        <Route path="business" element={<GenericPage title="For Business" />} />
        <Route path="chatgpt" element={<GenericPage title="ChatGPT" />} />
        <Route path="stories" element={<GenericPage title="Stories" />} />
        <Route path="plans" element={<PlansPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
      </Route>
    </Routes>
  );
}
