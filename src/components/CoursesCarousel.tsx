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

  const courses = coursesData as Course[];

  const duplicatedCourses = [...courses, ...courses, ...courses, ...courses, ...courses, ...courses];

  const getCurrentLanguage = (): 'ru' | 'kz' => {
    return (currentLanguage === 'ru' || currentLanguage === 'kz') ? currentLanguage : 'ru';
  };

  return (
    <div className="courses-carousel">
      <div className="courses-container">
        {duplicatedCourses.map((course, index) => (
          <div
            key={`${course.id}-${index}`}
            className="course-card"
            onMouseEnter={() => setHoveredCourse(course.id)}
            onMouseLeave={() => setHoveredCourse(null)}
          >
            <div className="course-thumbnail">
              <img src={course.thumbnail} alt={course.title[getCurrentLanguage()]} />
              {hoveredCourse === course.id && (
                <div className="course-overlay">
                  <div className="course-description">
                    {course.description[getCurrentLanguage()]}
                  </div>
                </div>
              )}
            </div>
            <div className="course-info">
              <h3 className="course-title">{course.title[getCurrentLanguage()]}</h3>
              <div className="course-stack">
                {course.stack.map((tech, techIndex) => (
                  <span key={techIndex} className="tech-tag">
                    {tech}
                  </span>
                ))}
              </div>
              <div className="course-modules">
                {course.totalModules} модулей
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CoursesCarousel;