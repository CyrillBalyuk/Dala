import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Landing from './pages/Landing';
import MyCourses from './pages/MyCourses';
import Course from './pages/Course';
import ModulePage from './pages/Module';
import VacanciesPage from './pages/VacanciesPage';
import ProjectsPage from './pages/ProjectsPage';
import './App.css';
import './i18n';

// Компонент для проверки аутентификации
function AuthenticatedRoute({ children }: { children: React.ReactNode }) {
  const userData = localStorage.getItem('edu_user');
  return userData ? <Navigate to="/my-courses" replace /> : <>{children}</>;
}

function AppContent() {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';
  const isModulePage = /^\/course\/[^/]+\/module\/[^/]+$/.test(location.pathname);
  const isMyCoursesPage = location.pathname === '/my-courses';
  const isCoursePage = /^\/course\/[^/]+$/.test(location.pathname) && !isModulePage;

  // Добавляем класс к body для правильной работы CSS
  React.useEffect(() => {
    // Удаляем все классы страниц
    document.body.classList.remove('my-courses-page', 'course-page');

    // Добавляем нужный класс
    if (isMyCoursesPage) {
      document.body.classList.add('my-courses-page');
    } else if (isCoursePage) {
      document.body.classList.add('course-page');
    }

    return () => document.body.classList.remove('my-courses-page', 'course-page');
  }, [isMyCoursesPage, isCoursePage]);

  return (
    <div className={`App ${isLandingPage ? 'landing-page' : ''}`}>
      {isLandingPage && <Header isModulePage={isModulePage} />}
      <main className={`main-content ${isModulePage ? 'module-page' : ''}`}>
        <Routes>
          <Route path="/" element={
            <AuthenticatedRoute>
              <Landing />
            </AuthenticatedRoute>
          } />
          <Route path="/my-courses" element={<MyCourses />} />
          <Route path="/course/:courseId" element={<Course />} />
          <Route path="/course/:courseId/module/:moduleId" element={<ModulePage />} />
          <Route path="/vacancies" element={<VacanciesPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
        </Routes>
      </main>
      {isLandingPage && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;