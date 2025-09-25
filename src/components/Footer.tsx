import { useTranslation } from '../hooks/useTranslation';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-contacts">
          <h3>{t('footer.contacts')}</h3>
          <div className="contact-info">
            <p>{t('footer.phone')}</p>
            <p>{t('footer.email')}</p>
            <p>{t('footer.address')}</p>
          </div>
        </div>
        <div className="footer-copyright">
          <p>{t('footer.copyright')}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;