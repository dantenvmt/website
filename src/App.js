import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Import layout and page components
import SideNav from './components/layout/SideNav';
import TopHeader from './components/layout/TopHeader';
import HomePage from './pages/HomePage';
import GenericPage from './pages/GenericPage';
import ResearchPage from './pages/research/index';
import AboutPage from './pages/company/AboutPage';
import CharterPage from './pages/company/CharterPage';
import CareersPage from './pages/company/CareersPage';
import PlansPage from './pages/PlansPage';
import ContactPage from './pages/company/ContactPage';
import CareerSearchPage from './pages/company/careers/CareerSearchPage';
export default function App() {
  const [isNavOpen, setIsNavOpen] = useState(true);

  return (
    <div className="bg-black text-white font-sans antialiased flex h-screen">
      <SideNav
        isNavOpen={isNavOpen}
        setIsNavOpen={setIsNavOpen}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopHeader />
        <main className="flex-grow overflow-y-auto">
          <Routes>
            <Route path="/" element={<HomePage />} />

            {/*Research*/}
            <Route path="/research" element={<Navigate to="/research/index" replace />} />
            <Route path="/research/index" element={<ResearchPage />} />
            <Route path="/research/overview" element={<GenericPage title="Research Overview" />} />
            <Route path="/research/residency" element={<GenericPage title="Research Residency" />} />
            {/*company*/}
            <Route path="/company/about-us" element={<AboutPage />} />
            <Route path="/company/our-charter" element={<CharterPage />} />
            <Route path="/company/careers" element={<CareersPage />} />
            <Route path="/company/contact" element={<ContactPage />} />
            {/*career*/}
            <Route path="/company/career/search" element={<CareerSearchPage />} />


            {/*others*/}
            <Route path="/safety" element={<GenericPage title="Safety" />} />
            <Route path="/business" element={<GenericPage title="For Business" />} />
            <Route path="/chatgpt" element={<GenericPage title="ChatGPT" />} />
            <Route path="/stories" element={<GenericPage title="Stories" />} />
            <Route path="/login" element={<GenericPage title="Login" />} />
            <Route path="/plans" element={<PlansPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}