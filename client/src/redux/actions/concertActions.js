export function LOAD_QUESTIONS(payload) {
  return { type: "LOAD_QUESTIONS", payload };
}

export function LOAD_ASSETS(payload) {
  return {type: "LOAD_ASSETS", payload};
}

export function NEXT_QUESTION() {
  return { type: "NEXT_QUESTION" }
}

export function RESET_CONCERT() {
  return { type: "RESET_CONCERT" }
}

