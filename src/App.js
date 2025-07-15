import React, { useState } from 'react';

import './App.css';

import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import PlansPage from './pages/PlansPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';


function App() {
  const [currentPage, setCurrentPage] = useState('home');

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
