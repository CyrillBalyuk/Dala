import { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import CoursesCarousel from '../components/CoursesCarousel';
import './Landing.css';

const Landing = () => {
  const { t } = useTranslation();
  const [heroText, setHeroText] = useState('');
  const [showContactModal, setShowContactModal] = useState(false);

  const fullHeroText = "Изучайте программирование с Dala";

  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index < fullHeroText.length) {
        setHeroText(fullHeroText.slice(0, index + 1));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 100);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="landing">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <img src="/assets/hero.jpg" alt="Hero" className="hero-image" />
          <div className="hero-overlay"></div>
        </div>
        <div className="hero-content">
          <div className="typing-text" data-testid="hero-typing-text">
            {heroText}
            <span className="cursor">|</span>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section id="courses" className="section courses-section">
        <div className="container">
          <h2 className="section-title">{t('header.courses')}</h2>
          <CoursesCarousel />
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="section about-section">
        <div className="container">
          <h2 className="section-title">{t('header.about')}</h2>
          <div className="about-content">
            <p>Dala — это инновационная образовательная платформа для изучения программирования и технологий. Мы предоставляем качественные курсы, практические проекты и персонализированный подход к обучению.</p>
            <p>Наша миссия — сделать программирование доступным для каждого и помочь студентам достичь своих карьерных целей в IT-индустрии.</p>
          </div>
        </div>
      </section>

      {/* Prices Section */}
      <section id="prices" className="section prices-section">
        <div className="container">
          <h2 className="section-title">{t('header.prices')}</h2>
          <div className="pricing-cards">
            <div className="pricing-card">
              <h3>1 месяц</h3>
              <div className="price">2 000 ₸</div>
              <ul className="features">
                <li>Доступ ко всем курсам</li>
                <li>Сертификаты</li>
                <li>Техническая поддержка</li>
              </ul>
              <button className="btn-primary">Выбрать план</button>
            </div>

            <div className="pricing-card featured">
              <h3>1 год</h3>
              <div className="price">20 000 ₸</div>
              <div className="discount">Экономия 4 000 ₸</div>
              <ul className="features">
                <li>Доступ ко всем курсам</li>
                <li>Сертификаты</li>
                <li>Приоритетная поддержка</li>
                <li>Персональный ментор</li>
              </ul>
              <button className="btn-primary">Выбрать план</button>
            </div>

            <div className="pricing-card">
              <h3>Для учреждений</h3>
              <div className="price">По запросу</div>
              <ul className="features">
                <li>Корпоративные лицензии</li>
                <li>Персональные курсы</li>
                <li>Аналитика и отчеты</li>
                <li>Интеграция с LMS</li>
              </ul>
              <button
                className="btn-primary"
                onClick={() => setShowContactModal(true)}
              >
                Связаться с нами
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Vacancies Section */}
      <section id="vacancies" className="section vacancies-section">
        <div className="container">
          <h2 className="section-title">{t('header.vacancies')}</h2>
          <div className="vacancies-placeholder">
            <p>Раздел находится в разработке. Скоро здесь появятся актуальные вакансии от наших партнеров.</p>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="section projects-section">
        <div className="container">
          <h2 className="section-title">{t('header.projects')}</h2>
          <div className="projects-placeholder">
            <p>Раздел находится в разработке. Скоро здесь будут представлены проекты наших студентов.</p>
          </div>
        </div>
      </section>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="modal-overlay" onClick={() => setShowContactModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Связаться с нами</h2>
              <button onClick={() => setShowContactModal(false)} className="modal-close">×</button>
            </div>
            <div className="modal-content">
              <p>Для получения корпоративного предложения свяжитесь с нами:</p>
              <div className="contact-info">
                <p><strong>Email:</strong> corporate@dala.kz</p>
                <p><strong>Телефон:</strong> +7 (777) 123-45-67</p>
                <p><strong>Telegram:</strong> @dala_support</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Landing;