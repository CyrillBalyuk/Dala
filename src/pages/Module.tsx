import { useParams } from 'react-router-dom';

const Module = () => {
  const { courseId, moduleId } = useParams();

  return (
    <div className="module">
      <div className="container">
        <h1>Модуль {moduleId} курса {courseId}</h1>
        <p>Страница модуля</p>
      </div>
    </div>
  );
};

export default Module;