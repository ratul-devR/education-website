const initialState = {
  questions: [],
  loading: true,
  currentPhase: "active",
  currentIndex: 0,
  activeLearningPlayedCount: 0,
  assets: {},
  useDefaultAsset: true,
  ended: false
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
                activeLearningBgAudio: new Audio(action.payload.background_sound.url),
                passiveLearningBgAudio: new Audio(action.payload.passive_background_sound.url),
                passiveLearningImage: action.payload.passive_image.url,
              }
            : {},
        useDefaultAsset: Object.keys(action.payload).length > 0 ? false : true,
      };
    }

    case "NEXT_QUESTION": {
      if (state.currentIndex + 1 < state.questions.length) {
        return {...state, currentIndex: state.currentIndex + 1}
      } else {
        return { ...state, currentPhase: "passive" }
      }
    }

    case "RESET_QUIZ": {
      return state;
    }

    default: {
      return state;
    }
  }
}
