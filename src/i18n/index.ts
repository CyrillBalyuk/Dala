import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import ruTranslations from './ru.json';
import kzTranslations from './kz.json';

const resources = {
  ru: {
    translation: ruTranslations
  },
  kz: {
    translation: kzTranslations
  }
};

const savedLanguage = localStorage.getItem('language') || 'kz';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage,
    fallbackLng: 'kz',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;