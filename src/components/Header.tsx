import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';

const Header = () => {
  const { t, changeLanguage, currentLanguage } = useTranslation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem('user');
    setIsAuthenticated(!!user);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    navigate('/');
  };

  const scrollToSection = (sectionId: string) => {
    if (window.location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          <Link to="/" className="logo">
            <img src="/assets/logo.svg" alt="Dala" className="logo-image" />
          </Link>
          <nav className="navigation">
            <button onClick={() => scrollToSection('courses')} className="nav-link">
              {t('header.courses')}
            </button>
            <button onClick={() => scrollToSection('about')} className="nav-link">
              {t('header.about')}
            </button>
            <button onClick={() => scrollToSection('prices')} className="nav-link">
              {t('header.prices')}
            </button>
            <button onClick={() => scrollToSection('vacancies')} className="nav-link">
              {t('header.vacancies')}
            </button>
            <button onClick={() => scrollToSection('projects')} className="nav-link">
              {t('header.projects')}
            </button>
          </nav>
        </div>
        <div className="header-right">
          <div className="language-switcher">
            <button
              className={`lang-btn ${currentLanguage === 'ru' ? 'active' : ''}`}
              onClick={() => changeLanguage('ru')}
            >
              RU
            </button>
            <span>|</span>
            <button
              className={`lang-btn ${currentLanguage === 'kz' ? 'active' : ''}`}
              onClick={() => changeLanguage('kz')}
            >
              KZ
            </button>
          </div>
          <div className="auth-buttons">
            {isAuthenticated ? (
              <>
                <Link to="/my-courses" className="auth-btn">
                  {t('header.myCourses')}
                </Link>
                <button onClick={handleLogout} className="auth-btn">
                  {t('header.logout')}
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setShowLoginModal(true)} className="auth-btn">
                  {t('header.login')}
                </button>
                <button onClick={() => setShowRegisterModal(true)} className="auth-btn register">
                  {t('header.register')}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {showLoginModal && (
        <div className="modal-overlay" onClick={() => setShowLoginModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t('header.login')}</h2>
              <button onClick={() => setShowLoginModal(false)} className="modal-close">×</button>
            </div>
            <div className="modal-content">
              <p>Модальное окно входа (заглушка)</p>
            </div>
          </div>
        </div>
      )}

      {showRegisterModal && (
        <div className="modal-overlay" onClick={() => setShowRegisterModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t('header.register')}</h2>
              <button onClick={() => setShowRegisterModal(false)} className="modal-close">×</button>
            </div>
            <div className="modal-content">
              <p>Модальное окно регистрации (заглушка)</p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;