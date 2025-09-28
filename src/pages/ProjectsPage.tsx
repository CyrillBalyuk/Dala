import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import projectsData from '../data/projects.json';
import './ProjectsPage.css';

interface Project {
  id: string;
  title: { ru: string; kz: string };
  shortDescription: { ru: string; kz: string };
  description: { ru: string; kz: string };
  thumbnail: string;
  url: string;
  technologies: string[];
  student: { ru: string; kz: string };
  completed: string;
}

const ProjectsPage: React.FC = () => {
  const { t, currentLanguage } = useTranslation();
  const currentLang = currentLanguage as 'ru' | 'kz';
  const projects: Project[] = projectsData;

  const handleOpenProject = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + '-01');
    return date.toLocaleDateString(currentLang === 'ru' ? 'ru-RU' : 'kk-KZ', {
      year: 'numeric',
      month: 'long'
    });
  };

  return (
    <div className="projects-page">
      <div className="container">
        <header className="page-header">
          <h1>{t('projects.title')}</h1>
          <p className="page-description">
            {t('projects.description')}
          </p>
        </header>

        <div className="projects-grid">
          {projects.map((project) => (
            <div key={project.id} className="project-card">
              <div className="project-thumbnail">
                <img
                  src={project.thumbnail}
                  alt={project.title[currentLang]}
                  onError={(e) => {
                    e.currentTarget.src = '/images/placeholder-project.jpg';
                  }}
                />
                <div className="project-overlay">
                  <button
                    className="open-project-button"
                    onClick={() => handleOpenProject(project.url)}
                  >
                    {t('projects.openButton')}
                  </button>
                </div>
              </div>

              <div className="project-content">
                <div className="project-header">
                  <h3 className="project-title">
                    {project.title[currentLang]}
                  </h3>
                  <p className="project-student">
                    {project.student[currentLang]}
                  </p>
                </div>

                <p className="project-short-description">
                  {project.shortDescription[currentLang]}
                </p>

                <div className="project-technologies">
                  {project.technologies.map((tech, index) => (
                    <span key={index} className="tech-tag">
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="project-footer">
                  <span className="project-date">
                    {t('projects.completed')}: {formatDate(project.completed)}
                  </span>
                  <button
                    className="view-project-button"
                    onClick={() => handleOpenProject(project.url)}
                  >
                    {t('projects.viewButton')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {projects.length === 0 && (
          <div className="empty-state">
            <h3>{t('projects.emptyTitle')}</h3>
            <p>{t('projects.emptyDescription')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsPage;