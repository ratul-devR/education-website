import { Button, IconButton } from "@chakra-ui/button";
import { Flex, HStack, VStack } from "@chakra-ui/layout";
import { Tooltip } from "@chakra-ui/tooltip";
import { MdQuiz } from "react-icons/md";
import { BsGrid1X2Fill } from "react-icons/bs";
import { NavLink, useRouteMatch } from "react-router-dom";
import { FaAssistiveListeningSystems } from "react-icons/fa";
import { GiBrain } from "react-icons/gi";
import useLogout from "../hooks/useLogout";

import Logo from "../assets/logo.png";

// this is the layout of the dashboard page
const Dashboard = ({ children }) => {
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
        <Tooltip label="Quiz / Learn" placement="right" hasArrow>
          <IconButton
            rounded={0}
            bg="white"
            as={NavLink}
            exact
            to={url}
            activeStyle={{ background: "#FF218D", color: "#fff" }}
            icon={<MdQuiz />}
          />
        </Tooltip>
        <Tooltip label="Active and Passive Learning Concert" placement="right" hasArrow>
          <IconButton
            rounded={0}
            bg="white"
            as={NavLink}
            exact
            to="/dashboard/alc"
            activeStyle={{ background: "#FF218D", color: "#fff" }}
            icon={<FaAssistiveListeningSystems />}
          />
        </Tooltip>
        <Tooltip label="Activation Phrase" placement="right" hasArrow>
          <IconButton
            rounded={0}
            bg="white"
            as={NavLink}
            exact
            to="/dashboard/activation_phrase"
            activeStyle={{ background: "#FF218D", color: "#fff" }}
            icon={<GiBrain />}
          />
        </Tooltip>
        <Tooltip label="Courses" placement="right" hasArrow>
          <IconButton
            rounded={0}
            bg="white"
            as={NavLink}
            exact
            to={`${url}/courses`}
            activeStyle={{ background: "#FF218D", color: "#fff" }}
            icon={<BsGrid1X2Fill />}
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
              overflowX="hidden"
              flexDirection="column"
              h="95%"
              bg="white"
              boxShadow="md"
              rounded={5}
            >
              {children}
            </Flex>
          </Flex>
        </Flex>
      </VStack>
    </HStack>
  );
};

export default Dashboard;
