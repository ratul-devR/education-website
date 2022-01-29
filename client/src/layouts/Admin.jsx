import { Button, IconButton } from "@chakra-ui/button";
import { Flex, HStack, VStack } from "@chakra-ui/layout";
import { Tooltip } from "@chakra-ui/tooltip";
import { FaChartPie, FaUserFriends, FaAssistiveListeningSystems } from "react-icons/fa";
import { AiOutlineCloudUpload } from "react-icons/ai";
import { SiConvertio } from "react-icons/si";
import { GrOrganization } from "react-icons/gr";
import { FiSettings } from "react-icons/fi";
import { GoMail } from "react-icons/go";
import { NavLink, useRouteMatch } from "react-router-dom";
import useLogout from "../hooks/useLogout";
import { useSelector } from "react-redux";
import { Text } from "@chakra-ui/react";

import Logo from "../assets/logo.png";

const Admin = ({ children }) => {
  const { appSubTitle } = useSelector((state) => state.settingsReducer);
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
        <Tooltip
          label="Active and passive learning concert assets manager"
          placement="right"
          hasArrow
        >
          <IconButton
            rounded={0}
            bg="white"
            as={NavLink}
            to={`${url}/alc`}
            activeStyle={{ background: "#FF218D", color: "#fff" }}
            icon={<FaAssistiveListeningSystems />}
          />
        </Tooltip>
        <Tooltip label="Upload audio files" placement="right" hasArrow>
          <IconButton
            rounded={0}
            bg="white"
            as={NavLink}
            to={`${url}/uploadFiles`}
            activeStyle={{ background: "#FF218D", color: "#fff" }}
            icon={<AiOutlineCloudUpload />}
          />
        </Tooltip>
        <Tooltip label="Converter" placement="right" hasArrow>
          <IconButton
            rounded={0}
            bg="white"
            as={NavLink}
            to={`${url}/converter`}
            activeStyle={{ background: "#FF218D", color: "#fff" }}
            icon={<SiConvertio />}
          />
        </Tooltip>
        <Tooltip label="Default Settings" placement="right" hasArrow>
          <IconButton
            rounded={0}
            bg="white"
            as={NavLink}
            to={`${url}/settings`}
            activeStyle={{ background: "#FF218D", color: "#fff" }}
            icon={<FiSettings />}
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
          height="80px"
          px={10}
          background="white"
        >
          <Flex direction="column" justify="center" align="center">
            <img src={Logo} style={{ width: "150px", display: "block" }} alt="Logo" />
            {appSubTitle && <Text color="GrayText">{appSubTitle}</Text>}
          </Flex>
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
