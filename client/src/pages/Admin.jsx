import { useEffect } from "react";
import { Switch, Route, useRouteMatch } from "react-router-dom";

import Layout from "../layouts/Admin";

import config from "../config";

// pages
import Categories from "../components/Admin/Categories";
import Users from "../components/Admin/Users";
import Questions from "../components/Admin/Questions";
import Alc from "../components/Admin/Alc";

const Admin = () => {
  const { path } = useRouteMatch();

  useEffect(() => {
    document.title = `${config.appName} - Admin dashboard`;
  }, []);

  return (
    <Layout>
      <Switch>
        <Route path={path} exact component={Categories} />
        <Route path={`${path}/users`} component={Users} />
        <Route path={`${path}/alc`} component={Alc} />
        <Route path={`${path}/:categoryId/questions`} component={Questions} />
      </Switch>
    </Layout>
  );
};

export default Admin;
