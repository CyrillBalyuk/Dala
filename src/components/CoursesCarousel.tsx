import { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import coursesData from '../data/courses.json';
import './CoursesCarousel.css';

interface Course {
  id: string;
  title: {
    ru: string;
    kz: string;
  };
  stack: string[];
  totalModules: number;
  thumbnail: string;
  description: {
    ru: string;
    kz: string;
  };
}

const CoursesCarousel = () => {
  const { currentLanguage } = useTranslation();
  const [hoveredCourse, setHoveredCourse] = useState<string | null>(null);

  const getCurrentLanguage = (): 'ru' | 'kz' => {
    return (currentLanguage === 'ru' || currentLanguage === 'kz') ? currentLanguage : 'ru';
  };

  // Используем курсы из JSON файла
  const allCourses = coursesData as Course[];

  return (
    <div className="courses-section">
      <div className="courses-grid">
        {allCourses.map((course, index) => (
          <div
            key={`${course.id}-${index}`}
            className="course-card"
            onMouseEnter={() => setHoveredCourse(course.id)}
            onMouseLeave={() => setHoveredCourse(null)}
          >
            <div className="course-info">
              <h3 className="course-title">{course.title[getCurrentLanguage()]}</h3>
            </div>
            <div className="course-thumbnail">
              <img src={course.thumbnail} alt={course.title[getCurrentLanguage()]} />
            </div>
            {hoveredCourse === course.id && (
              <div className="course-overlay">
                <div className="course-description-hover">
                  {course.description[getCurrentLanguage()]}
                </div>
                <div className="course-modules">
                  {course.totalModules} {getCurrentLanguage() === 'ru' ? 'модулей' : 'модуль'}
                </div>
                <div className="course-stack">
                  {course.stack.map((tech, techIndex) => (
                    <span key={techIndex} className="tech-tag">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CoursesCarousel;