import { VStack, Flex } from "@chakra-ui/layout";
import { NavLink, useRouteMatch, Switch, Route } from "react-router-dom";
import { UnorderedList, ListItem, Link, Text } from "@chakra-ui/react";
import { useSelector } from "react-redux";

import Login from "../components/Registration/Login";
import Register from "../components/Registration/Register";
import CreateOrg from "../components/Registration/CreateOrg";
import LoginOrg from "../components/Registration/LoginOrg";
import ForgotPass from "../components/Registration/ForgotPass"
import ResetPass from "../components/Registration/ResetPass"

import Logo from "../assets/logo.png";

const Registration = () => {
  const { appSubTitle } = useSelector((state) => state.settingsReducer);
  const { path } = useRouteMatch();

  return (
    <VStack h="100vh" overflow="hidden" spacing={0}>
      <Flex py={2} px={10} as="nav" boxShadow="sm" w="100%" justify="space-between" align="center">
        <Flex direction="column" justify="center" align="center">
          <img
            style={{ display: "block", width: "200px" }}
            src={Logo}
            alt="Official Logo of check2Learn"
          />
          {appSubTitle && <Text color="GrayText">{appSubTitle}</Text>}
        </Flex>

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
          <Route path={`${path}/loginOrg`} component={LoginOrg} />
          <Route path={`${path}/resetPass/:userId`} component={ResetPass} />
          <Route path={`${path}/forgotPass`} component={ForgotPass} />
        </Switch>
      </Flex>
    </VStack>
  );
};

export default Registration;
