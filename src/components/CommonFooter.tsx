import { useTranslation } from '../hooks/useTranslation';
import './CommonFooter.css';

const CommonFooter = () => {
  const { t } = useTranslation();

  return (
    <footer className="common-footer">
      <div className="common-footer-container">
        <div className="common-footer-contacts">
          <h3>{t('footer.contacts')}</h3>
          <div className="common-contact-info">
            <p>{t('footer.phone')}</p>
            <p>{t('footer.email')}</p>
            <p>{t('footer.address')}</p>
          </div>
        </div>
        <div className="common-footer-copyright">
          <p>{t('footer.copyright')}</p>
        </div>
      </div>
    </footer>
  );
};

export default CommonFooter;