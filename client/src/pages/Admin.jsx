import { Flex } from "@chakra-ui/layout";
import { useEffect } from "react";
import { Switch, Route, useRouteMatch } from "react-router-dom";

import Layout from "../layouts/Admin";

import config from "../config";

// pages
import Categories from "../components/Admin/Categories";
import Users from "../components/Admin/Users";
import AddQuestion from "../components/Admin/AddQuestion";

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
          <Route path={`${path}/addQuestion/:categoryId/:categoryName`} component={AddQuestion} />
        </Switch>
      </Flex>
    </Layout>
  );
};

export default Admin;
