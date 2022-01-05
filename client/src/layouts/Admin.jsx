import { Button, IconButton } from "@chakra-ui/button";
import { Flex, HStack, VStack } from "@chakra-ui/layout";
import { Tooltip } from "@chakra-ui/tooltip";
import { FaChartPie, FaUserFriends, FaAssistiveListeningSystems } from "react-icons/fa";
import { AiOutlineCloudUpload } from "react-icons/ai";
import { GrOrganization } from "react-icons/gr";
import { GoMail } from "react-icons/go";
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
        <Tooltip label="Active and Passive learning Concert Manager" placement="right" hasArrow>
          <IconButton
            rounded={0}
            bg="white"
            as={NavLink}
            to={`${url}/alc`}
            activeStyle={{ background: "#FF218D", color: "#fff" }}
            icon={<FaAssistiveListeningSystems />}
          />
        </Tooltip>
        <Tooltip label="Upload Files" placement="right" hasArrow>
          <IconButton
            rounded={0}
            bg="white"
            as={NavLink}
            to={`${url}/uploadFiles`}
            activeStyle={{ background: "#FF218D", color: "#fff" }}
            icon={<AiOutlineCloudUpload />}
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
        <Tooltip label="Organizations" placement="right" hasArrow>
          <IconButton
            rounded={0}
            bg="white"
            as={NavLink}
            to={`${url}/organizations`}
            activeStyle={{ background: "#FF218D", color: "#fff" }}
            icon={<GrOrganization />}
          />
        </Tooltip>
        <Tooltip label="Send Mails To Organizations" placement="right" hasArrow>
          <IconButton
            rounded={0}
            bg="white"
            as={NavLink}
            to={`${url}/sendMails`}
            activeStyle={{ background: "#FF218D", color: "#fff" }}
            icon={<GoMail />}
          />
        </Tooltip>
      </Flex>
      <VStack spacing={0} flex={1} overflow="hidden" h="full" w="full">
        <Flex
          as="nav"
          w="full"
          justify="space-between"
          align="center"
          boxShadow="md"
          height="60px"
          px={10}
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
            p={3}
          >
            <Flex
              p={[5, 10, 10, 10]}
              w="full"
              flexDirection="column"
              h="full"
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
