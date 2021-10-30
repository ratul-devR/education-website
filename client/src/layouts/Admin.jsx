import { Button, IconButton } from "@chakra-ui/button";
import { Flex, Heading, HStack, VStack } from "@chakra-ui/layout";
import { Tooltip } from "@chakra-ui/tooltip";
import { FaChartPie, FaUserFriends } from "react-icons/fa";
import { NavLink, useRouteMatch } from "react-router-dom";

const Admin = ({ children }) => {
  const { url } = useRouteMatch();

  return (
    <HStack height="100vh" spacing={0}>
      <Flex
        direction="column"
        h="full"
        borderRight="1px solid"
        borderColor="gray.200"
        background="white"
        gridRowGap={5}
        w="full"
        maxW={16}
        py={5}
      >
        <Tooltip label="Categories" placement="right" hasArrow>
          <IconButton
            rounded={0}
            bg="white"
            as={NavLink}
            exact
            to={url}
            activeStyle={{ background: "#319795", color: "#fff" }}
            icon={<FaChartPie />}
          />
        </Tooltip>
        <Tooltip label="Users" placement="right" hasArrow>
          <IconButton
            rounded={0}
            bg="white"
            as={NavLink}
            to={`${url}/users`}
            activeStyle={{ background: "#319795", color: "#fff" }}
            icon={<FaUserFriends />}
          />
        </Tooltip>
      </Flex>
      <VStack spacing={0} flex={1} overflow="hidden" h="full" w="full">
        <Flex
          as="nav"
          w="full"
          justify="space-around"
          align="center"
          boxShadow="md"
          height="60px"
          background="white"
        >
          <Heading fontSize="3xl" fontWeight="normal">
            Edu
          </Heading>
          <Button colorScheme="teal">Log out</Button>
        </Flex>
        {/* all the contents */}
        {children}
      </VStack>
    </HStack>
  );
};

export default Admin;
