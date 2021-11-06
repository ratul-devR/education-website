import { useEffect } from "react";
import { Switch, Route, useRouteMatch } from "react-router-dom";

import config from "../config";

import Layout from "../layouts/Dashboard";

// pages
import UserCourses from "../components/Dashboard/UserCourses";
import Courses from "../components/Dashboard/Courses";
import Quiz from "../components/Dashboard/Quiz/";
import Pay from "../components/Dashboard/Pay";

const Dashboard = () => {
  const { path } = useRouteMatch();

  useEffect(() => {
    document.title = `${config.appName} - Dashboard`;
  }, []);

  return (
    <Layout>
      <Switch>
        <Route path={path} exact component={UserCourses} />
        <Route path={`${path}/courses`} component={Courses} />
        <Route path={`${path}/quiz/:courseId`} component={Quiz} />
        <Route path={`${path}/pay/:courseId/`} component={Pay} />
      </Switch>
    </Layout>
  );
};

export default Dashboard;
