export function LOGIN(payload) {
  return { type: "LOGIN", payload };
}

export function LOGOUT() {
  return { type: "LOGOUT" };
}
