import React, { useState } from 'react';
import './App.css';

// Import layout and page components
import SideNav from './components/layout/SideNav';
import TopHeader from './components/layout/TopHeader';
import HomePage from './pages/HomePage';
import GenericPage from './pages/GenericPage';
import ResearchPage from './pages/ResearchPage';
import AboutPage from './pages/AboutPage';
import CharterPage from './pages/CharterPage';
import CareersPage from './pages/CareersPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [activeSubPage, setActiveSubPage] = useState(null);
  const [isNavOpen, setIsNavOpen] = useState(true);

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'research':
        return <ResearchPage />;
      case 'company':
        // Within the 'company' section, render the correct sub-page
        if (activeSubPage === 'our-charter') return <CharterPage />;
        if (activeSubPage === 'careers') return <CareersPage />;
        // Default to the About Us page for the company section
        return <AboutPage />;
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
      default:
        return <HomePage />;
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
