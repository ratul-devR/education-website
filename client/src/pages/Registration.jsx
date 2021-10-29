import { VStack, Flex } from "@chakra-ui/layout";
import { NavLink, useRouteMatch, Switch, Route } from "react-router-dom";
import { Heading, UnorderedList, ListItem, Link } from "@chakra-ui/react";

import Login from "../components/Registration/Login";
import Register from "../components/Registration/Register";

const Registration = () => {
  const { path } = useRouteMatch();

  return (
    <VStack h="100vh" overflow="hidden" spacing={0}>
      <Flex py={2} as="nav" boxShadow="sm" w="100%" justify="space-around" align="center">
        <Heading variant="h3" fontWeight="normal">
          Edu
        </Heading>

        <UnorderedList display="flex" gridColumnGap={5} alignItems="center">
          <ListItem listStyleType="none">
            New here?{" "}
            <Link as={NavLink} color="teal" exact to={`${path}/register`}>
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
        </Switch>
      </Flex>
    </VStack>
  );
};

export default Registration;
