const initialState = {
  questions: [],
  loading: true,
  currentPhase: "active",
  currentIndex: 0,
  activeLearningPlayedBefore: false,
  assets: {},
  useDefaultAsset: true,
  ended: false,
};

export default function concertReducer(state = initialState, action) {
  switch (action.type) {
    case "LOAD_QUESTIONS": {
      return {
        ...state,
        questions: action.payload,
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
        useDefaultAsset: Object.keys(action.payload).length > 0 ? false : true,
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
          };
        } else if (state.currentPhase === "active" && state.activeLearningPlayedBefore) {
          return { ...state, ended: true };
        } else if (state.currentPhase === "active" && !state.activeLearningPlayedBefore) {
          return { ...state, currentIndex: 0, currentPhase: "passive" };
        }
      }
    }

    case "RESET_CONCERT": {
      return initialState;
    }

    default: {
      return state;
    }
  }
}
