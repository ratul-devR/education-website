import { useEffect } from "react";
import config from "../config";

const Register = () => {
  useEffect(() => {
    document.title = `${config.appName} - Register Account`;
  }, []);

  return (
    <div>
      <h1>Register</h1>
    </div>
  );
};

export default Register;
