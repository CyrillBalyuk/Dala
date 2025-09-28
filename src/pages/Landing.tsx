import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import CoursesCarousel from '../components/CoursesCarousel';
import './Landing.css';

const Landing = () => {
  const { t } = useTranslation();
  const [heroText, setHeroText] = useState('');
  const [showContactModal, setShowContactModal] = useState(false);
  const [heroTextOpacity, setHeroTextOpacity] = useState(1);

  const fullHeroText = t('landing.heroText');

  // Создаем версию изображения только один раз
  const [imageVersion] = useState(() => Date.now());

  // Мемоизируем стили для typing-text
  const typingTextStyle = useMemo(() => ({
    opacity: heroTextOpacity
  }), [heroTextOpacity]);

  useEffect(() => {
    setHeroText(''); // Сбрасываем текст при смене языка

    // Используем setTimeout для более плавной анимации
    const animateText = () => {
      let index = 0;
      const animate = () => {
        if (index <= fullHeroText.length) {
          setHeroText(fullHeroText.slice(0, index));
          index++;
          // Используем requestAnimationFrame для лучшей производительности
          if (index <= fullHeroText.length) {
            setTimeout(animate, 100);
          }
        }
      };
      animate();
    };

    // Небольшая задержка перед началом анимации
    const startDelay = setTimeout(animateText, 50);

    return () => {
      clearTimeout(startDelay);
    };
  }, [fullHeroText]);

  useEffect(() => {
    // Кэшируем высоту hero секции
    const heroHeight = window.innerHeight * 0.74;
    const startFade = heroHeight * 0.3;
    const endFade = heroHeight * 0.8;

    // Throttling для скролл обработчика
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY;

          if (scrollY <= startFade) {
            setHeroTextOpacity(1);
          } else if (scrollY >= endFade) {
            setHeroTextOpacity(0);
          } else {
            const progress = (scrollY - startFade) / (endFade - startFade);
            setHeroTextOpacity(1 - progress);
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Проверяем начальное состояние

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="landing">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <img src={`/assets/hero.jpg?v=${imageVersion}`} alt="Hero" className="hero-image" />
          <div className="hero-overlay"></div>
        </div>
        <div className="hero-content">
          <div
            className="typing-text"
            style={typingTextStyle}
            data-testid="hero-typing-text"
          >
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
          <h2 className="section-title">{t('landing.aboutTitle')}</h2>
          <div className="about-content">
            <p>{t('landing.aboutText1')}</p>
            <p>{t('landing.aboutText2')}</p>
            <p>{t('landing.aboutText3')}</p>
          </div>
        </div>
      </section>

      {/* Prices Section */}
      <section id="prices" className="section prices-section">
        <div className="container">
          <h2 className="section-title">{t('header.prices')}</h2>
          <div className="pricing-cards">
            {/* 1.2.3.1 Индивидуальная подписка на месяц */}
            <div className="pricing-card">
              <h3>{t('landing.pricing.monthlyTitle')}</h3>
              <div className="duration">{t('landing.pricing.monthlyDuration')}</div>
              <div className="price">{t('landing.pricing.monthlyPrice')}</div>
              <ul className="features">
                <li>{t('landing.pricing.features')}</li>
              </ul>
              <button className="btn-primary">{t('landing.pricing.buyButton')}</button>
            </div>

            {/* 1.2.3.2 Индивидуальная подписка на год */}
            <div className="pricing-card featured">
              <h3>{t('landing.pricing.yearlyTitle')}</h3>
              <div className="duration">{t('landing.pricing.yearlyDuration')}</div>
              <div className="price">{t('landing.pricing.yearlyPrice')}</div>
              <ul className="features">
                <li>{t('landing.pricing.features')}</li>
              </ul>
              <button className="btn-primary">{t('landing.pricing.buyButton')}</button>
            </div>

            {/* 1.2.3.3 Для образовательных учреждений */}
            <div className="pricing-card">
              <h3>{t('landing.pricing.institutionTitle')}</h3>
              <div className="duration">{t('landing.pricing.institutionDuration')}</div>
              <div className="price">{t('landing.pricing.institutionPrice')}</div>
              <ul className="features">
                <li>{t('landing.pricing.features')}</li>
              </ul>
              <button
                className="btn-primary"
                onClick={() => setShowContactModal(true)}
              >
                {t('landing.pricing.contactButton')}
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
            <p>{t('vacancies.emptyTitle')}. {t('vacancies.emptyDescription')}</p>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="section projects-section">
        <div className="container">
          <h2 className="section-title">{t('header.projects')}</h2>
          <div className="projects-placeholder">
            <p>{t('projects.emptyTitle')}. {t('projects.emptyDescription')}</p>
          </div>
        </div>
      </section>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="modal-overlay" onClick={() => setShowContactModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t('landing.contact.modalTitle')}</h2>
              <button onClick={() => setShowContactModal(false)} className="modal-close">×</button>
            </div>
            <div className="modal-content">
              <p>{t('landing.contact.modalDescription')}</p>
              <div className="contact-info">
                <p><strong>{t('landing.contact.email')}</strong> corporate@dala.kz</p>
                <p><strong>{t('landing.contact.phone')}</strong> +7 (777) 123-45-67</p>
                <p><strong>{t('landing.contact.telegram')}</strong> @dala_support</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Landing;