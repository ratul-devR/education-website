import { useEffect } from "react";
import { Switch, Route, useRouteMatch } from "react-router-dom";

import config from "../config";

import Layout from "../layouts/Dashboard";

// pages
import UserCourses from "../components/Dashboard/UserCourses";
import Courses from "../components/Dashboard/Courses";
import CreateOrg from "../components/Dashboard/CreateOrg";

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
        <Route path={`${path}/createOrg`} component={CreateOrg} />
      </Switch>
    </Layout>
  );
};

export default Dashboard;
