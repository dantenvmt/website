import React, { useState } from 'react';
import './App.css';

// Import layout and page components
import SideNav from './components/layout/SideNav';
import TopHeader from './components/layout/TopHeader';
import HomePage from './pages/HomePage';
import GenericPage from './pages/GenericPage';
import ResearchPage from './pages/research/ResearchPage';
import AboutPage from './pages/company/AboutPage';
import CharterPage from './pages/company/CharterPage';
import CareersPage from './pages/company/CareersPage';
import PlansPage from './pages/PlansPage';
import ContactPage from './pages/company/ContactPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [activeSubPage, setActiveSubPage] = useState(null);
  const [isNavOpen, setIsNavOpen] = useState(true);

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage setPage={setCurrentPage} setActiveSubPage={setActiveSubPage} />;
      case 'research':
        return <ResearchPage />;
      case 'company':
        switch (activeSubPage) {
          case 'about-us':
            return <AboutPage />;
          case 'our-charter':
            return <CharterPage />;
          case 'careers':
            return <CareersPage />;
          case 'contact':
            return <ContactPage />;
          default:
            return <AboutPage />;
        }
      case 'safety':
        return <GenericPage title="Safety" />;
      case 'business':
        return <GenericPage title="For Business" />;
      case 'chatgpt':
        return <GenericPage title="ChatGPT" />;
      case 'stories':
        return <GenericPage title="Stories" />;
      case 'login':
        return <GenericPage title="Login" />;
      case 'plans':
        return <PlansPage />;
      default:
        return <HomePage setPage={setCurrentPage} setActiveSubPage={setActiveSubPage} />;
    }
  };

  return (
    <div className="bg-black text-white font-sans antialiased flex h-screen">
      <SideNav
        currentPage={currentPage}
        setPage={setCurrentPage}
        activeSubPage={activeSubPage}
        setActiveSubPage={setActiveSubPage}
        isNavOpen={isNavOpen}
        setIsNavOpen={setIsNavOpen}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopHeader setPage={setCurrentPage} />
        <main className="flex-grow overflow-y-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}