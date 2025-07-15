// Import React and the useState hook
import React, { useState } from 'react';

// Import the CSS for this component
import './App.css';

// --- IMPORT YOUR PAGE AND LAYOUT COMPONENTS ---
// Make sure you have created these files in the correct folders!
// For example, Header.js should be in 'src/components/layout/'
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import PlansPage from './pages/PlansPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';


function App() {
  // State to manage which page is currently being shown
  const [currentPage, setCurrentPage] = useState('home');

  // Function to render the correct page based on the state
  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage setPage={setCurrentPage} />;
      case 'about':
        return <AboutPage />;
      case 'plans':
        return <PlansPage setPage={setCurrentPage} />;
      case 'login':
        return <LoginPage setPage={setCurrentPage} />;
      case 'register':
        return <RegisterPage setPage={setCurrentPage} />;
      default:
        return <HomePage setPage={setCurrentPage} />;
    }
  };

  // Don't show the main header/footer on the login/register pages
  const isAuthPage = currentPage === 'login' || currentPage === 'register';

  return (
    <div className="App">
      {!isAuthPage && <Header currentPage={currentPage} setPage={setCurrentPage} />}

      <main>
        {renderPage()}
      </main>

      {!isAuthPage && <Footer />}
    </div>
  );
}

export default App;
