import { useEffect } from "react";

import config from "../config";

const Dashboard = ({ user }) => {
  useEffect(() => {
    document.title = `${config.appName} - Dashboard`;
  }, []);

  return (
    <div>
      <h1>Here is the dashboard of username: {user.lastName}</h1>
    </div>
  );
};

export default Dashboard;
