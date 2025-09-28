import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import vacanciesData from '../data/vacancies.json';
import ApplyModal from '../components/ApplyModal';
import './VacanciesPage.css';

interface Vacancy {
  id: string;
  title: { ru: string; kz: string };
  company: { ru: string; kz: string };
  shortDescription: { ru: string; kz: string };
  description: { ru: string; kz: string };
  metadata: {
    experience: { ru: string; kz: string };
    type: { ru: string; kz: string };
    location: { ru: string; kz: string };
  };
}

const VacanciesPage: React.FC = () => {
  const { t, currentLanguage } = useTranslation();
  const [selectedVacancy, setSelectedVacancy] = useState<string | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  const currentLang = currentLanguage as 'ru' | 'kz';
  const vacancies: Vacancy[] = vacanciesData;

  const handleApplyClick = (vacancyId: string) => {
    setSelectedVacancy(vacancyId);
    setIsApplyModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsApplyModalOpen(false);
    setSelectedVacancy(null);
  };

  return (
    <div className="vacancies-page">
      <div className="container">
        <header className="page-header">
          <h1>{t('vacancies.title')}</h1>
          <p className="page-description">
            {t('vacancies.description')}
          </p>
        </header>

        <div className="vacancies-grid">
          {vacancies.map((vacancy) => (
            <div key={vacancy.id} className="vacancy-card">
              <div className="vacancy-header">
                <h3 className="vacancy-title">
                  {vacancy.title[currentLang]}
                </h3>
                <p className="vacancy-company">
                  {vacancy.company[currentLang]}
                </p>
              </div>

              <p className="vacancy-short-description">
                {vacancy.shortDescription[currentLang]}
              </p>

              <div className="vacancy-metadata">
                <div className="metadata-item">
                  <span className="metadata-label">{t('vacancies.experience')}:</span>
                  <span className="metadata-value">{vacancy.metadata.experience[currentLang]}</span>
                </div>
                <div className="metadata-item">
                  <span className="metadata-label">{t('vacancies.type')}:</span>
                  <span className="metadata-value">{vacancy.metadata.type[currentLang]}</span>
                </div>
                <div className="metadata-item">
                  <span className="metadata-label">{t('vacancies.location')}:</span>
                  <span className="metadata-value">{vacancy.metadata.location[currentLang]}</span>
                </div>
              </div>

              <button
                className="apply-button"
                onClick={() => handleApplyClick(vacancy.id)}
              >
                {t('vacancies.applyButton')}
              </button>
            </div>
          ))}
        </div>
      </div>

      {isApplyModalOpen && selectedVacancy && (
        <ApplyModal
          isOpen={isApplyModalOpen}
          onClose={handleCloseModal}
          vacancyId={selectedVacancy}
          vacancyTitle={vacancies.find(v => v.id === selectedVacancy)?.title[currentLang] || ''}
        />
      )}
    </div>
  );
};

export default VacanciesPage;