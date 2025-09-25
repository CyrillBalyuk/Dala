import { useTranslation as useReactI18next } from 'react-i18next';

export const useTranslation = () => {
  const { t, i18n } = useReactI18next();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  return {
    t,
    changeLanguage,
    currentLanguage: i18n.language
  };
};