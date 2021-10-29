import { useEffect } from "react";
import config from "../config";

const Login = () => {
  useEffect(() => {
    document.title = `${config.appName} - Login`;
  }, []);

  return (
    <div>
      <h1>Login</h1>
    </div>
  );
};

export default Login;
