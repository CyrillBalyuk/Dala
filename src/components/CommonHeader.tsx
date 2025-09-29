import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import './CommonHeader.css';

const CommonHeader = () => {
  const { t, changeLanguage, currentLanguage } = useTranslation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('edu_user');
    navigate('/');
  };

  return (
    <header className="common-header">
      <div className="common-header-container">
        <div className="common-header-left">
          <Link to="/" className="common-logo">
            <img src="/assets/logo.svg" alt="CodeDala" className="common-logo-image" />
          </Link>
        </div>
        <div className="common-header-right">
          <div className="common-language-switcher">
            <button
              className={`common-lang-btn ${currentLanguage === 'ru' ? 'active' : ''}`}
              onClick={() => changeLanguage('ru')}
            >
              RU
            </button>
            <span>|</span>
            <button
              className={`common-lang-btn ${currentLanguage === 'kz' ? 'active' : ''}`}
              onClick={() => changeLanguage('kz')}
            >
              KZ
            </button>
          </div>
          <button onClick={handleLogout} className="common-logout-btn">
            {t('header.logout')}
          </button>
        </div>
      </div>
    </header>
  );
};

export default CommonHeader;