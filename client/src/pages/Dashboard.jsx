import { useEffect } from "react";
import { Switch, Route, useRouteMatch } from "react-router-dom";

import config from "../config";

import Layout from "../layouts/Dashboard";

// pages
import Quiz from "../components/Dashboard/Quiz";
import Courses from "../components/Dashboard/Courses";

const Dashboard = () => {
  const { path } = useRouteMatch();

  useEffect(() => {
    document.title = `${config.appName} - Dashboard`;
  }, []);

  return (
    <Layout>
      <Switch>
        <Route path={path} exact component={Quiz} />
        <Route path={`${path}/courses`} component={Courses} />
      </Switch>
    </Layout>
  );
};

export default Dashboard;
