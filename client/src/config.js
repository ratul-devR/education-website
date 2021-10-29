const config = {
  appName: "Education Website",
  serverURL: import.meta.env.MODE === "development" ? "http://localhost:8000" : "",
};

export default config;
