export function LOGIN(payload) {
  return { type: "LOGIN", payload };
}

export function LOGOUT() {
  return { type: "LOGOUT" };
}

export function ORG_LOGIN(payload) {
  return { type: "ORG_LOGIN", payload };
}
