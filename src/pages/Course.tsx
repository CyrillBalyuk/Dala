import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CommonHeader from '../components/CommonHeader';
import CommonFooter from '../components/CommonFooter';
import { useTranslation } from '../hooks/useTranslation';
import coursesData from '../data/courses.json';
import modulesData from '../data/modules.json';
import { CertificateGenerator, Language } from '../utils/certificateGenerator';
import './Course.css';

interface Course {
  id: string;
  title: {
    ru: string;
    kz: string;
  };
  stack: string[];
  modules: string[];
  certificateTemplates: {
    ru: string;
    kz: string;
    en: string;
  };
  totalModules: number;
  thumbnail: string;
  description: {
    ru: string;
    kz: string;
  };
}

interface Module {
  id: string;
  courseId: string;
  title: {
    ru: string;
    kz: string;
  };
  assignments: string[];
}

interface CourseProgress {
  [courseId: string]: {
    [assignmentId: string]: boolean;
  };
}

interface User {
  id: string;
  name: string;
  email: string;
}

const Course = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { currentLanguage } = useTranslation();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [progress, setProgress] = useState<CourseProgress>({});
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isGeneratingCertificate, setIsGeneratingCertificate] = useState(false);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!courseId) return;

    // Load course data
    const foundCourse = coursesData.find(c => c.id === courseId);
    if (foundCourse) {
      setCourse(foundCourse as Course);
    }

    // Load modules for this course
    const courseModules = modulesData.filter(m => m.courseId === courseId) as Module[];
    setModules(courseModules);

    // Load progress from localStorage
    const progressData = localStorage.getItem('edu_progress');
    if (progressData) {
      setProgress(JSON.parse(progressData));
    }

    // Load user data from localStorage
    const userData = localStorage.getItem('edu_user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, [courseId]);

  useEffect(() => {
    if (!courseId || modules.length === 0) return;

    // Calculate completion percentage and module progress
    const courseProgress = progress[courseId] || {};
    const totalAssignments = modules.reduce((sum, module) => sum + module.assignments.length, 0);

    // Count completed assignments from nested structure
    let completedAssignments = 0;
    for (const moduleId in courseProgress) {
      if (typeof courseProgress[moduleId] === 'object') {
        completedAssignments += Object.values(courseProgress[moduleId]).filter(Boolean).length;
      } else {
        // Old flat structure fallback
        completedAssignments += courseProgress[moduleId] ? 1 : 0;
      }
    }


    const percentage = totalAssignments > 0 ? Math.round((completedAssignments / totalAssignments) * 100) : 0;
    setCompletionPercentage(percentage);
    setIsCompleted(percentage === 100);
  }, [progress, modules, courseId]);

  // Синхронизация ширины progress bar с заголовком
  useEffect(() => {
    const updateProgressWidth = () => {
      if (titleRef.current && progressRef.current) {
        const titleWidth = titleRef.current.offsetWidth;
        progressRef.current.style.width = `${titleWidth}px`;
      }
    };

    updateProgressWidth();
    window.addEventListener('resize', updateProgressWidth);
    return () => window.removeEventListener('resize', updateProgressWidth);
  }, [course]);

  const isAssignmentCompleted = (assignmentId: string): boolean => {
    if (!courseId) return false;

    // Check the flat structure: progress[courseId][assignmentId]
    return !!progress[courseId]?.[assignmentId];
  };

  const getFirstIncompleteAssignment = (module: Module): string => {
    for (const assignmentId of module.assignments) {
      if (!isAssignmentCompleted(assignmentId)) {
        return assignmentId;
      }
    }
    return module.assignments[0]; // If all completed, return first
  };

  const handleModuleClick = (module: Module) => {
    const targetAssignment = getFirstIncompleteAssignment(module);
    navigate(`/course/${courseId}/module/${module.id}?assignment=${targetAssignment}`);
  };

  const handleStartCourse = () => {
    if (modules.length > 0) {
      const firstModule = modules[0];
      const firstAssignment = getFirstIncompleteAssignment(firstModule);
      navigate(`/course/${courseId}/module/${firstModule.id}?assignment=${firstAssignment}`);
    }
  };

  const downloadCertificate = async (language: Language) => {
    if (!user) {
      alert(currentLanguage === 'kz'
        ? 'Сертификатты жүктеп алу үшін кіріңіз'
        : 'Войдите, чтобы скачать сертификат');
      return;
    }

    if (!isCompleted) {
      alert(currentLanguage === 'kz'
        ? 'Сертификат алу үшін курсты аяқтаңыз'
        : 'Завершите курс, чтобы получить сертификат');
      return;
    }

    if (!course || !courseId) {
      alert(currentLanguage === 'kz'
        ? 'Қате: курс деректері табылмады'
        : 'Ошибка: данные курса не найдены');
      return;
    }

    setIsGeneratingCertificate(true);

    try {
      const courseTitle = course.title[language === 'kz' ? 'kz' : 'ru'] || course.title.ru;

      await CertificateGenerator.generateCertificate(
        courseId,
        courseTitle,
        user.name,
        user.id,
        language
      );
    } catch (error) {
      console.error('Certificate generation failed:', error);
      alert(currentLanguage === 'kz'
        ? 'Сертификат жасауда қате. Кейін қайталаңыз.'
        : 'Ошибка при создании сертификата. Попробуйте позже.');
    } finally {
      setIsGeneratingCertificate(false);
    }
  };

  if (!course) {
    return (
      <div className="course">
        <div className="container">
          <h1>{currentLanguage === 'kz' ? 'Курс табылмады' : 'Курс не найден'}</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="course">
      <CommonHeader />
      <div className="course-header">
        <div className="container">
          <h1 ref={titleRef} className="course-title">{course.title[currentLanguage as keyof typeof course.title] || course.title.ru}</h1>
        </div>
      </div>

      <div className="course-content">
        <div className="container">
          <div className="course-layout">
            {/* Left Sidebar */}
            <div className="course-sidebar">
              <div className="modules-list">
                {modules.map((module, index) => {
                  return (
                    <div
                      key={module.id}
                      className="module-item"
                      onClick={() => handleModuleClick(module)}
                    >
                      <div className="module-header">
                        <span className="module-number">{index + 1}</span>
                        <div className="module-info">
                          <h4 className="module-title">{module.title[currentLanguage as keyof typeof module.title] || module.title.ru}</h4>
                          <span className="module-count">{module.assignments.length} {currentLanguage === 'kz' ? 'тапсырма' : 'заданий'}</span>
                        </div>
                      </div>
                      <div className="assignments-indicators">
                        {module.assignments.map((assignmentId) => (
                          <div
                            key={assignmentId}
                            className={`assignment-circle ${
                              isAssignmentCompleted(assignmentId) ? 'completed' : 'incomplete'
                            }`}
                          >
                            {isAssignmentCompleted(assignmentId) && (
                              <svg className="check-icon" viewBox="0 0 16 16" fill="currentColor">
                                <path d="M13.485 3.515a1 1 0 0 1 0 1.414L6.243 12.17a1 1 0 0 1-1.415 0L1.515 8.857a1 1 0 0 1 1.414-1.414l2.83 2.829 6.726-6.727a1 1 0 0 1 1.414 0z"/>
                              </svg>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Content */}
            <div className="course-main">
              {/* Course Description */}
              <div className="course-description">
                <h3>{currentLanguage === 'kz' ? 'Курс туралы' : 'О курсе'}</h3>
                <p>{course.description[currentLanguage as keyof typeof course.description] || course.description.ru}</p>

                <div className="course-stack">
                  <h4>{currentLanguage === 'kz' ? 'Технологиялар:' : 'Технологии:'}</h4>
                  <div className="stack-tags">
                    {course.stack.map((tech, index) => (
                      <span key={index} className="stack-tag">{tech}</span>
                    ))}
                  </div>
                </div>

                <div className="course-cta">
                  <button
                    className="start-course-btn"
                    onClick={handleStartCourse}
                  >
                    {completionPercentage > 0
                      ? (currentLanguage === 'kz' ? 'Курсты жалғастыру' : 'Продолжить курс')
                      : (currentLanguage === 'kz' ? 'Курсты бастау' : 'Начать курс')
                    }
                  </button>
                </div>
              </div>

              {/* Certificate Section */}
              <div className="certificate-section">
                <h3>{currentLanguage === 'kz' ? 'Аяқтау туралы сертификат' : 'Сертификат о завершении'}</h3>
                <div className="certificate-preview">
                  <div className="certificate-thumbnail">
                    <img
                      src="https://via.placeholder.com/400x300/f8f9fa/6c757d?text=Certificate+Preview"
                      alt="Certificate Preview"
                      className="cert-image"
                    />
                  </div>
                  {!user ? (
                    <div className="certificate-locked">
                      <p>{currentLanguage === 'kz' ? 'Сертификатты жүктеп алу үшін кіріңіз' : 'Войдите, чтобы скачать сертификат'}</p>
                    </div>
                  ) : isCompleted ? (
                    <div className="certificate-actions">
                      <button
                        className="cert-download-btn"
                        onClick={() => downloadCertificate('kz')}
                        disabled={isGeneratingCertificate}
                      >
                        {isGeneratingCertificate ? (currentLanguage === 'kz' ? 'Жасалуда...' : 'Создается...') : 'Скачать (KZ)'}
                      </button>
                      <button
                        className="cert-download-btn"
                        onClick={() => downloadCertificate('ru')}
                        disabled={isGeneratingCertificate}
                      >
                        {isGeneratingCertificate ? (currentLanguage === 'kz' ? 'Жасалуда...' : 'Создается...') : 'Скачать (RU)'}
                      </button>
                      <button
                        className="cert-download-btn"
                        onClick={() => downloadCertificate('en')}
                        disabled={isGeneratingCertificate}
                      >
                        {isGeneratingCertificate ? (currentLanguage === 'kz' ? 'Жасалуда...' : 'Создается...') : 'Скачать (EN)'}
                      </button>
                    </div>
                  ) : (
                    <div className="certificate-locked">
                      <p>{currentLanguage === 'kz' ? 'Сертификат алу үшін курсты аяқтаңыз' : 'Завершите курс, чтобы получить сертификат'}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <CommonFooter />
    </div>
  );
};

export default Course;