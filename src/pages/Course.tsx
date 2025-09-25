import { useParams } from 'react-router-dom';

const Course = () => {
  const { courseId } = useParams();

  return (
    <div className="course">
      <div className="container">
        <h1>Курс {courseId}</h1>
        <p>Страница курса</p>
      </div>
    </div>
  );
};

export default Course;