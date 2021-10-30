import { Flex } from "@chakra-ui/layout";
import { useEffect } from "react";
import { Switch, Route, useRouteMatch } from "react-router-dom";

import Layout from "../layouts/Admin";

import config from "../config";

// pages
import Categories from "../components/Admin/Categories";
import Users from "../components/Admin/Users";

const Admin = () => {
  const { path } = useRouteMatch();

  useEffect(() => {
    document.title = `${config.appName} - Admin dashboard`;
  }, []);

  return (
    <Layout>
      <Flex bg="gray.100" direction="column" flex={1} w="full" overflowX="hidden">
        <Switch>
          <Route path={path} exact component={Categories} />
          <Route path={`${path}/users`} component={Users} />
        </Switch>
      </Flex>
    </Layout>
  );
};

export default Admin;
