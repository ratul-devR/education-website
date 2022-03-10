const initialState = {
  questions: [],
  course: {},
  loading: true,
  currentPhase: "active",
  activeLearningEnded: false,
  passiveLearningEnded: false,
  currentIndex: 0,
  activeLearningPlayedBefore: false,
  assets: {},
  ended: false,
  concertStarted: false,
};

export default function concertReducer(state = initialState, action) {
  switch (action.type) {
    case "LOAD_QUESTIONS": {
      return {
        ...state,
        questions: action.payload.questions,
        course: action.payload.course,
        loading: false,
      };
    }

    case "LOAD_ASSETS": {
      return {
        ...state,
        assets:
          Object.keys(action.payload).length > 0
            ? {
                activeLearningBgAudio: action.payload.background_sound.url,
                passiveLearningBgAudio: action.payload.passive_background_sound.url,
                passiveLearningImage: action.payload.passive_image.url,
              }
            : {},
      };
    }

    case "NEXT_WORD": {
      if (state.currentIndex + 1 < state.questions.length) {
        return { ...state, currentIndex: state.currentIndex + 1 };
      } else {
        if (state.currentPhase === "passive" && !state.activeLearningPlayedBefore) {
          return {
            ...state,
            currentPhase: "active",
            currentIndex: 0,
            activeLearningPlayedBefore: true,
            passiveLearningEnded: true,
          };
        } else if (state.currentPhase === "active" && state.activeLearningPlayedBefore) {
          return { ...state, ended: true, activeLearningEnded: false, passiveLearningEnded: false };
        } else if (state.currentPhase === "active" && !state.activeLearningPlayedBefore) {
          return { ...state, currentIndex: 0, currentPhase: "passive", activeLearningEnded: true };
        }
      }
    }

    case "START_ACTIVE_LEARNING": {
      return { ...state, passiveLearningEnded: false };
    }

    case "START_PASSIVE_LEARNING": {
      return { ...state, activeLearningEnded: false };
    }

    case "RESET_CONCERT": {
      return initialState;
    }

    case "START_CONCERT": {
      return { ...state, concertStarted: true };
    }

    default: {
      return state;
    }
  }
}
