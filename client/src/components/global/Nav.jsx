import { NavLink } from "react-router-dom";
import { Flex, Heading, UnorderedList, ListItem, Link } from "@chakra-ui/react";

const Nav = () => {
  return (
    <Flex py={2} as="nav" boxShadow="sm" w="100%" justify="space-around" align="center">
      <Heading variant="h3" fontWeight="normal">
        Edu
      </Heading>

      <UnorderedList display="flex" gridColumnGap={5} alignItems="center">
        <ListItem listStyleType="none">
          New here?{" "}
          <Link as={NavLink} color="teal" exact to="/register">
            Sign up
          </Link>{" "}
          to get started
        </ListItem>
      </UnorderedList>
    </Flex>
  );
};

export default Nav;
