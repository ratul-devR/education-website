import { VStack, Flex } from "@chakra-ui/layout";
import { NavLink, useRouteMatch, Switch, Route } from "react-router-dom";
import { UnorderedList, ListItem, Link } from "@chakra-ui/react";

import Login from "../components/Registration/Login";
import Register from "../components/Registration/Register";
import CreateOrg from "../pages/CreateOrg";

import Logo from "../assets/logo.png";

const Registration = () => {
  const { path } = useRouteMatch();

  return (
    <VStack h="100vh" overflow="hidden" spacing={0}>
      <Flex py={2} as="nav" boxShadow="sm" w="100%" justify="space-around" align="center">
        <img
          style={{ display: "block", width: "200px" }}
          src={Logo}
          alt="Official Logo of check2Learn"
        />

        <UnorderedList display="flex" gridColumnGap={5} alignItems="center">
          <ListItem listStyleType="none">
            New organization?{" "}
            <Link as={NavLink} color="primary" exact to={`${path}/createOrg`}>
              Sign up
            </Link>{" "}
            to get started
          </ListItem>
        </UnorderedList>
      </Flex>

      <Flex direction="column" overflowX="hidden" h="full" w="full">
        <Switch>
          <Route path={path} exact component={Login} />
          <Route path={`${path}/register`} component={Register} />
          <Route path={`${path}/createOrg`} component={CreateOrg} />
        </Switch>
      </Flex>
    </VStack>
  );
};

export default Registration;
