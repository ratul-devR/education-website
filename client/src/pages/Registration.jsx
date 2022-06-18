import { VStack, Flex, Box } from "@chakra-ui/layout";
import { NavLink, useRouteMatch, Switch, Route } from "react-router-dom";
import { UnorderedList, ListItem, Link, Text } from "@chakra-ui/react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import Login from "../components/Registration/Login";
import Register from "../components/Registration/Register";
import CreateOrg from "../components/Registration/CreateOrg";
import LoginOrg from "../components/Registration/LoginOrg";
import ForgotPass from "../components/Registration/ForgotPass";
import ResetPass from "../components/Registration/ResetPass";

import Logo from "../assets/logo.png";

const Registration = () => {
  const { appSubTitle } = useSelector((state) => state.settingsReducer);
  const { path } = useRouteMatch();
  const { t } = useTranslation();

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
            {t("new_org")}{" "}
            <Link as={NavLink} color="primary" exact to={`${path}/createOrg`}>
              {t("to_get_started")}
            </Link>{" "}
          </ListItem>
        </UnorderedList>
      </Flex>

      <Box py={10} overflowX="hidden" overflowY={"auto"} h="full" w="full">
        <Switch>
          <Route path={path} exact component={Login} />
          <Route path={`${path}/register`} component={Register} />
          <Route path={`${path}/createOrg`} component={CreateOrg} />
          <Route path={`${path}/loginOrg`} component={LoginOrg} />
          <Route path={`${path}/resetPass/:userId`} component={ResetPass} />
          <Route path={`${path}/forgotPass`} component={ForgotPass} />
        </Switch>
      </Box>
    </VStack>
  );
};

export default Registration;
