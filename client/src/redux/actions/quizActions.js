export function LOAD_QUIZ(payload) {
  return {
    type: "LOAD_QUIZ",
    payload,
  };
}

export function RESET_QUIZ() {
  return { type: "RESET_QUIZ" };
}

export function NEXT_QUESTION() {
  return { type: "NEXT_QUESTION" };
}

export function CHANGE_SCORE(payload) {
  return { type: "CHANGE_SCORE", payload };
}

export function DONT_KNOW() {
  return { type: "DONT_KNOW" };
}

export function WRONG_ANSWER() {
  return { type: "WRONG_ANSWER" };
}
