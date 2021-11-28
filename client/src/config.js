const config = {
  appName: "Check2Learn",
  serverURL: import.meta.env.MODE === "development" ? "http://localhost:8000" : "",
};

export default config;
