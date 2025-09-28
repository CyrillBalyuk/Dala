import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import ModalAuth from './ModalAuth';

interface HeaderProps {
  isModulePage?: boolean;
}

const Header = ({ isModulePage = false }: HeaderProps) => {
  const { t, changeLanguage, currentLanguage } = useTranslation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [headerOpacity, setHeaderOpacity] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const userData = localStorage.getItem('edu_user');
    if (userData) {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      // Получаем высоту hero секции (40vh)
      const heroHeight = window.innerHeight * 0.4;
      const scrollY = window.scrollY;

      // Точка 1: начало перехода (20% от высоты hero)
      const startTransition = heroHeight * 0.2;
      // Точка 2: конец перехода (70% от высоты hero)
      const endTransition = heroHeight * 0.7;

      if (scrollY <= startTransition) {
        // Полностью прозрачная
        setHeaderOpacity(0);
        setIsScrolled(false);
      } else if (scrollY >= endTransition) {
        // Полностью непрозрачная
        setHeaderOpacity(1);
        setIsScrolled(true);
      } else {
        // Плавный переход между точками
        const progress = (scrollY - startTransition) / (endTransition - startTransition);
        setHeaderOpacity(progress);
        setIsScrolled(progress > 0.5);
      }
    };

    // Только на главной странице добавляем слушатель скролла
    if (location.pathname === '/') {
      window.addEventListener('scroll', handleScroll);
      handleScroll(); // Проверяем начальное состояние
    } else {
      setIsScrolled(true); // На других страницах шапка всегда непрозрачная
      setHeaderOpacity(1);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('edu_user');
    setIsAuthenticated(false);
    navigate('/');
  };

  const handleAuthSuccess = (userData: any) => {
    localStorage.setItem('edu_user', JSON.stringify(userData));
    setIsAuthenticated(true);
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

  const isLandingPage = location.pathname === '/';

  return (
    <header
      className={`header ${isLandingPage && !isScrolled ? 'header-transparent' : ''}`}
      style={{
        backgroundColor: isLandingPage
          ? `rgba(255, 255, 255, ${headerOpacity})`
          : '#fff'
      }}
    >
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
              className={`lang-btn ${currentLanguage === 'ru' ? 'active' : ''} ${isModulePage ? 'disabled' : ''}`}
              onClick={() => !isModulePage && changeLanguage('ru')}
              disabled={isModulePage}
              title={isModulePage ? t('language.disabledTooltip') : ''}
            >
              RU
            </button>
            <span>|</span>
            <button
              className={`lang-btn ${currentLanguage === 'kz' ? 'active' : ''} ${isModulePage ? 'disabled' : ''}`}
              onClick={() => !isModulePage && changeLanguage('kz')}
              disabled={isModulePage}
              title={isModulePage ? t('language.disabledTooltip') : ''}
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

      <ModalAuth
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        type="login"
        onAuthSuccess={handleAuthSuccess}
      />

      <ModalAuth
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        type="register"
        onAuthSuccess={handleAuthSuccess}
      />
    </header>
  );
};

export default Header;