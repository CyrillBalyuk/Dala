import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CommonHeader from '../components/CommonHeader';
import CommonFooter from '../components/CommonFooter';
import coursesData from '../data/courses.json';
import './MyCourses.css';

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

interface CourseProgress {
  courseId: string;
  completedModules: number;
  totalModules: number;
  isCompleted: boolean;
  lastAccessed: string;
}

const MyCourses = () => {
  const [progress, setProgress] = useState<CourseProgress[]>([]);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated
    const userData = localStorage.getItem('edu_user');
    if (!userData) {
      navigate('/');
      return;
    }
    setUser(JSON.parse(userData));

    // Load progress from localStorage
    const progressData = localStorage.getItem('edu_progress');
    if (progressData) {
      const parsed = JSON.parse(progressData);
      // Убеждаемся что это массив
      setProgress(Array.isArray(parsed) ? parsed : []);
    } else {
      // Если данных нет, устанавливаем пустой массив
      setProgress([]);
    }
  }, [navigate]);

  // Get all available courses (only from courses.json - courses with real images)
  const allCourses: Course[] = coursesData as Course[];

  // Get courses in progress (started but not completed)
  const coursesInProgress = progress.filter(p => !p.isCompleted && p.completedModules > 0);

  // Get completed courses
  const completedCourses = progress.filter(p => p.isCompleted);

  // Get available courses (not started)
  const availableCourses = allCourses.filter(course =>
    !progress.find(p => p.courseId === course.id)
  );


  const getCourseDetails = (courseId: string): Course | undefined => {
    return allCourses.find(course => course.id === courseId);
  };


  const startCourse = (courseId: string) => {
    // For demo purposes, we'll just navigate to the course
    navigate(`/course/${courseId}`);
  };

  const renderCourseCard = (course: Course, progressData?: CourseProgress, isGray: boolean = false) => (
    <div key={course.id} className={`course-card ${isGray ? 'course-card-gray' : ''}`}>
      <div className="course-thumbnail">
        <img src={course.thumbnail} alt={course.title.ru} />
        {progressData && (
          <div className="progress-overlay">
            <div className="progress-text">
              {progressData.completedModules}/{progressData.totalModules} модулей
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${(progressData.completedModules / progressData.totalModules) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>
      <div className="course-info">
        <h3 className="course-title">{course.title.ru}</h3>
        <div className="course-stack">
          {course.stack.map((tech, index) => (
            <span key={index} className="tech-tag">
              {tech}
            </span>
          ))}
        </div>
        <div className="course-modules">
          {course.totalModules} модулей
        </div>
        {isGray && (
          <button
            className="start-course-btn"
            onClick={() => startCourse(course.id)}
          >
            Начать курс
          </button>
        )}
      </div>
    </div>
  );

  const renderAvailableCourseCard = (course: Course) => (
    <div key={course.id} className="available-course-card">
      <div className="available-course-thumbnail">
        <img src={course.thumbnail} alt={course.title.ru} className="course-image" />
      </div>
      <div className="available-course-info">
        <h3 className="course-title">{course.title.ru}</h3>
        <div className="course-stack">
          {course.stack.map((tech, index) => (
            <span key={index} className="tech-tag">
              {tech}
            </span>
          ))}
        </div>
      </div>
      <div className="course-description-overlay">
        <div className="course-description-content">
          <p className="course-description">{course.description.ru}</p>
          <div className="course-modules-hover">{course.totalModules} модулей</div>
          <button
            className="start-course-btn-hover"
            onClick={() => startCourse(course.id)}
          >
            Начать курс
          </button>
        </div>
      </div>
    </div>
  );

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="my-courses">
      <CommonHeader />
      <div className="container">
        <h1>Добро пожаловать, {user.name}!</h1>

        <div className="courses-content">
          {/* Мои курсы */}
          {coursesInProgress.length > 0 && (
            <div className="courses-section">
              <h2>Мои курсы</h2>
              <div className="courses-grid">
                {coursesInProgress.map(progressData => {
                  const course = getCourseDetails(progressData.courseId);
                  return course ? renderCourseCard(course, progressData) : null;
                })}
              </div>
            </div>
          )}

          {/* Доступные курсы */}
          {availableCourses.length > 0 && (
            <div className="courses-section">
              <h2>Доступные курсы</h2>
              <div className="courses-grid">
                {availableCourses.map(course => renderAvailableCourseCard(course))}
              </div>
            </div>
          )}

          {/* Пройденные курсы */}
          {completedCourses.length > 0 && (
            <div className="courses-section">
              <h2>Пройденные курсы</h2>
              <div className="courses-grid">
                {completedCourses.map(progressData => {
                  const course = getCourseDetails(progressData.courseId);
                  return course ? renderCourseCard(course, progressData) : null;
                })}
              </div>
            </div>
          )}

          {/* Показываем сообщение только если вообще нет курсов */}
          {coursesInProgress.length === 0 && completedCourses.length === 0 && availableCourses.length === 0 && (
            <div className="courses-section">
              <p className="empty-message">Курсы не найдены.</p>
            </div>
          )}
        </div>
      </div>
      <CommonFooter />
    </div>
  );
};

export default MyCourses;