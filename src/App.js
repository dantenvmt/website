import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

import MainLayout from './components/layout/MainLayout';
import EditorLayout from './components/resume/EditorLayout';
import { AuthProvider, useAuth } from './context/AuthContext'; // Verify path
import { ResumeProvider } from './context/ResumeContext';
// --- Page Components ---
import HomePage from './pages/HomePage';
import GenericPage from './pages/GenericPage';
import ContactPage from './pages/company/ContactPage';
import ResumeDashboardPage from './pages/resume/ResumeDashboardPage';
import Contact from './pages/resume/contact';
import Experience from './pages/resume/experience';
import Education from './pages/resume/education';
import Skills from './pages/resume/skills';
import Awards from './pages/resume/awards';
import Certificates from './pages/resume/certifications';
import Summary from './pages/resume/summary';
import FinalResumePage from './pages/resume/FinalResumePage';
import JobBoard from './pages/job-board/JobBoard';
import Projects from './pages/resume/projects';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoginPage from './pages/auth/LoginPage';
import AdminRoute from './components/auth/AdminRoute';
import AdminPage from './pages/admin/AdminPage';
import NotFoundPage from './pages/NotFoundPage';
import UserStatusPage from './pages/user/UserStatusPage';
import ChangePasswordPage from './pages/user/ChangePasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ContentManagerPage from './pages/admin/ContentManagerPage';
import ArticlePage from './pages/ArticlePage';
export default function App() {
  const { user } = useAuth();
  return (
    <AuthProvider>
      <ResumeProvider>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route
              path="admin"
              element={
                <AdminRoute> {/* <-- USE AdminRoute */}
                  <AdminPage />
                </AdminRoute>
              }
            />
            <Route path="admin/content-manager" element={
              <AdminRoute>
                <ContentManagerPage />
              </AdminRoute>
            } />
            <Route
              path="settings/change-password"
              element={
                <ProtectedRoute> {/* Use ProtectedRoute */}
                  <ChangePasswordPage />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFoundPage />} />
            {/* --- Main Site Routes --- */}
            <Route index element={<HomePage />} />

            <Route path="company" element={<Navigate to="/company/contact" replace />} />
            <Route path="company/contact" element={<ContactPage />} />

            <Route path='job_board' element={<JobBoard />} />

            <Route path="login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/news/:id" element={<ArticlePage />} />
            {/* --- Resume Routes --- */}
            {/* The main dashboard for resumes */}
            <Route path="resume" element={<ResumeDashboardPage />} />
            <Route path="resume/:resumeId/final" element={<FinalResumePage />} />
            {/* The resume editor with nested routes for each section */}

            <Route
              path="resume/:resumeId"
              element={
                <ProtectedRoute>
                  <EditorLayout />
                </ProtectedRoute>
              }
            >
              <Route path="contact" element={<Contact />} />
              <Route path="experience" element={<Experience />} />
              <Route path="education" element={<Education />} />
              <Route path="skills" element={<Skills />} />
              <Route path="awards" element={<Awards />} />
              <Route path="certifications" element={<Certificates />} />
              <Route path="projects" element={<Projects />} />
              <Route path="summary" element={<Summary />} />
            </Route>

            {/* --- NEW User Status Route --- */}
            <Route
              path="my-status"
              element={
                <ProtectedRoute>
                  {user?.role === 'client' ? (
                    <UserStatusPage />
                  ) : (
                    // If a 'user' tries to access this, kick them to their allowed dashboard
                    <Navigate to="/dashboard" replace />
                  )}
                </ProtectedRoute>
              }
            />
          </Route>
          {/* --- Admin Route --- */}

        </Routes>
      </ResumeProvider>
    </AuthProvider>
  );
}