import { useEffect } from "react";
import config from "../config";

const Admin = ({ user }) => {
  useEffect(() => {
    document.title = `${config.appName} - Admin dashboard`;
  }, []);

  return (
    <div>
      <h1>Hey there admin: {user.lastName}</h1>
    </div>
  );
};

export default Admin;
