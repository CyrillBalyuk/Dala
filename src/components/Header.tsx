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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
      // Получаем высоту hero секции
      const heroHeight = window.innerHeight * 0.74;
      const scrollY = window.scrollY;

      // Точка 1: начало перехода
      const startTransition = heroHeight * 0.65;
      // Точка 2: конец перехода
      const endTransition = heroHeight * 0.9;

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

  // Закрываем мобильное меню при изменении размера окна
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1000) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  // Логика выбора логотипа:
  // - На главной странице в широкоэкранном режиме (без мобильного меню) - обычное лого
  // - Везде в остальных случаях - лого с названием
  const shouldUseLandingLogo = isLandingPage && !isMobileMenuOpen;
  const logoSrc = shouldUseLandingLogo ? "/assets/logo.svg" : "/assets/logo_with_name.svg";

  // Временная отладка
  console.log('Header Debug:', {
    pathname: location.pathname,
    isLandingPage,
    isMobileMenuOpen,
    shouldUseLandingLogo,
    logoSrc
  });

  return (
    <header
      className={`header ${isLandingPage && !isScrolled && !isMobileMenuOpen ? 'header-transparent' : ''} ${isMobileMenuOpen ? 'mobile-menu-open' : ''}`}
      style={{
        backgroundColor: isMobileMenuOpen
          ? '#fff'
          : isLandingPage
            ? `rgba(255, 255, 255, ${headerOpacity})`
            : '#fff'
      }}
    >
      <div className="header-container">
        <div className="header-left">
          <Link to="/" className="logo">
            <img src={logoSrc} alt="Dala" className="logo-image" />
          </Link>
          <nav className="navigation desktop-nav">
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

        <div className="header-right desktop-header-right">
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

        {/* Mobile Menu Button */}
        <button
          className="mobile-menu-button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`hamburger-line ${isMobileMenuOpen ? 'open' : ''}`}></span>
          <span className={`hamburger-line ${isMobileMenuOpen ? 'open' : ''}`}></span>
          <span className={`hamburger-line ${isMobileMenuOpen ? 'open' : ''}`}></span>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="mobile-menu">
          <nav className="mobile-navigation">
            <button
              onClick={() => {
                scrollToSection('courses');
                setIsMobileMenuOpen(false);
              }}
              className="mobile-nav-link"
            >
              {t('header.courses')}
            </button>
            <button
              onClick={() => {
                scrollToSection('about');
                setIsMobileMenuOpen(false);
              }}
              className="mobile-nav-link"
            >
              {t('header.about')}
            </button>
            <button
              onClick={() => {
                scrollToSection('prices');
                setIsMobileMenuOpen(false);
              }}
              className="mobile-nav-link"
            >
              {t('header.prices')}
            </button>
            <button
              onClick={() => {
                scrollToSection('vacancies');
                setIsMobileMenuOpen(false);
              }}
              className="mobile-nav-link"
            >
              {t('header.vacancies')}
            </button>
            <button
              onClick={() => {
                scrollToSection('projects');
                setIsMobileMenuOpen(false);
              }}
              className="mobile-nav-link"
            >
              {t('header.projects')}
            </button>
          </nav>

          <div className="mobile-header-bottom">
            <div className="mobile-language-switcher">
              <button
                className={`mobile-lang-btn ${currentLanguage === 'ru' ? 'active' : ''} ${isModulePage ? 'disabled' : ''}`}
                onClick={() => !isModulePage && changeLanguage('ru')}
                disabled={isModulePage}
              >
                RU
              </button>
              <span>|</span>
              <button
                className={`mobile-lang-btn ${currentLanguage === 'kz' ? 'active' : ''} ${isModulePage ? 'disabled' : ''}`}
                onClick={() => !isModulePage && changeLanguage('kz')}
                disabled={isModulePage}
              >
                KZ
              </button>
            </div>

            <div className="mobile-auth-buttons">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/my-courses"
                    className="mobile-auth-btn"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t('header.myCourses')}
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="mobile-auth-btn"
                  >
                    {t('header.logout')}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setShowLoginModal(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="mobile-auth-btn"
                  >
                    {t('header.login')}
                  </button>
                  <button
                    onClick={() => {
                      setShowRegisterModal(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="mobile-auth-btn register"
                  >
                    {t('header.register')}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

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