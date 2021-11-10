import { Button, IconButton } from "@chakra-ui/button";
import { Flex, HStack, VStack } from "@chakra-ui/layout";
import { Tooltip } from "@chakra-ui/tooltip";
import { FaChartPie, FaUserFriends, FaAssistiveListeningSystems } from "react-icons/fa";
import { NavLink, useRouteMatch } from "react-router-dom";
import useLogout from "../hooks/useLogout";

import Logo from "../assets/logo.png";

// this is the layout of the admin page
const Admin = ({ children }) => {
  const { url } = useRouteMatch();

  const logout = useLogout();

  return (
    <HStack height="100vh" spacing={0}>
      <Flex
        direction="column"
        h="full"
        borderRight="1px solid"
        borderColor="gray.200"
        background="white"
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
            activeStyle={{ background: "#FF218D", color: "#fff" }}
            icon={<FaChartPie />}
          />
        </Tooltip>
        <Tooltip label="Active Learning Concert" placement="right" hasArrow>
          <IconButton
            rounded={0}
            bg="white"
            as={NavLink}
            to={`${url}/alc`}
            activeStyle={{ background: "#FF218D", color: "#fff" }}
            icon={<FaAssistiveListeningSystems />}
          />
        </Tooltip>
        <Tooltip label="Users" placement="right" hasArrow>
          <IconButton
            rounded={0}
            bg="white"
            as={NavLink}
            to={`${url}/users`}
            activeStyle={{ background: "#FF218D", color: "#fff" }}
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
          <img src={Logo} style={{ width: "150px", display: "block" }} alt="Logo" />
          <Button onClick={logout} colorScheme="blue">
            Log out
          </Button>
        </Flex>
        {/* all the contents */}
        <Flex bg="gray.100" direction="column" flex={1} w="full" overflowX="hidden">
          <Flex
            w="full"
            h="full"
            flexDirection="column"
            overflow="hidden"
            justify="center"
            align="center"
          >
            <Flex
              p={[5, 10, 10, 10]}
              w="95%"
              flexDirection="column"
              h="95%"
              bg="white"
              boxShadow="md"
              rounded={5}
              overflow="auto"
            >
              {children}
            </Flex>
          </Flex>
        </Flex>
      </VStack>
    </HStack>
  );
};

export default Admin;
