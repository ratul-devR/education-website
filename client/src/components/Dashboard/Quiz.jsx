import { useParams } from "react-router";

const Quiz = () => {
  const { courseId } = useParams();

  return (
    <div>
      <h1>{courseId}</h1>
    </div>
  );
};

export default Quiz;
