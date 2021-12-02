const initialState = {
  course: {},
  questions: [],
  loading: true,
  currentIndex: 0,
  done: false,
  timeLimit: 0,
  score: 0,
  totalPercentage: 0,
  questionsDontKnow: 0,
  questionsWrong: 0,
};

const quizReducer = (state = initialState, action) => {
  switch (action.type) {
    // for loading all the quiz details
    case "LOAD_QUIZ": {
      const payload = action.payload;
      return {
        ...state,
        questions: payload.questions,
        loading: false,
        course: payload.course,
        timeLimit: payload.timeLimit,
      };
    }

    // for resetting the quiz
    case "RESET_QUIZ": {
      return initialState;
    }

    // for getting the next question
    case "NEXT_QUESTION": {
      if (state.currentIndex + 1 < state.questions.length) {
        return {
          ...state,
          currentIndex: (state.currentIndex += 1),
          timeLimit: state.course.timeLimit,
        };
      } else {
        return { ...state, done: true };
      }
    }

    // for updating the timeLimit of the quiz
    case "UPDATE_TIME": {
      return { ...state, timeLimit: state.timeLimit + 1 };
    }

    // for changing the score
    case "CHANGE_SCORE": {
      return {
        ...state,
        score: state.score + 1,
        totalPercentage: Math.round(((state.score + 1) * 100) / state.questions.length),
      };
    }

    // if the user doesn't knows the answer
    case "DONT_KNOW": {
      return { ...state, questionsDontKnow: state.questionsDontKnow + 1 };
    }

    // if the answer is wrong
    case "WRONG_ANSWER": {
      return { ...state, questionsWrong: state.questionsWrong + 1 };
    }

    default: {
      return state;
    }
  }
};

export default quizReducer;
