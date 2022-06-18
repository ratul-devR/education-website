import { Button, IconButton } from "@chakra-ui/button";
import { Flex, HStack, VStack, Heading, Box } from "@chakra-ui/layout";
import { Text, Link } from "@chakra-ui/react";
import { Tooltip } from "@chakra-ui/tooltip";
import { MdQuiz } from "react-icons/md";
import { NavLink, useRouteMatch } from "react-router-dom";
import { FaAssistiveListeningSystems } from "react-icons/fa";
import { GiBrain } from "react-icons/gi";
import useLogout from "../hooks/useLogout";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import Logo from "../assets/logo.png";

// this is the layout of the dashboard page
const Dashboard = ({ children }) => {
  const { user } = useSelector((state) => state.authReducer);
  const { appSubTitle } = useSelector((state) => state.settingsReducer);
  const { url } = useRouteMatch();
  const { t } = useTranslation();

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
        <Tooltip label={t("checking_phase")} placement="right" hasArrow>
          <IconButton
            rounded={0}
            bg="white"
            as={NavLink}
            exact
            to={url}
            activeStyle={{ background: "#FF218D", color: "#fff" }}
            icon={<MdQuiz />}
          />
        </Tooltip>{" "}
        <Tooltip label={t("alc_plc")} placement="right" hasArrow>
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
        <Tooltip label={t("activation_phase")} placement="right" hasArrow>
          <IconButton
            rounded={0}
            bg="white"
            as={NavLink}
            exact
            to="/dashboard/activation_phase"
            activeStyle={{ background: "#FF218D", color: "#fff" }}
            icon={<GiBrain />}
          />
        </Tooltip>
        {/* <Tooltip label="Courses" placement="right" hasArrow>
          <IconButton
            rounded={0}
            bg="white"
            as={NavLink}
            exact
            to={`${url}/courses`}
            activeStyle={{ background: "#FF218D", color: "#fff" }}
            icon={<BsGrid1X2Fill />}
          />
        </Tooltip> */}
      </Flex>
      <VStack spacing={0} flex={1} overflow="hidden" h="full" w="full">
        <Flex
          as="nav"
          w="full"
          justify="space-between"
          align="center"
          boxShadow="md"
          background="white"
          px={10}
          py={3}
        >
          <Flex direction="column" justify="center" align="center">
            <img src={Logo} style={{ width: "150px", display: "block" }} alt="Logo" />
            {appSubTitle && (
              <Text whiteSpace="pre-wrap" color="GrayText">
                {appSubTitle}
              </Text>
            )}
          </Flex>
          <Flex justify="center" align={"center"} gridGap={3}>
            <Text>{user && user?.firstName + " " + user?.lastName}</Text>
            <Button onClick={logout} minW="150px" colorScheme="blue">
              {t("logout")}
            </Button>
          </Flex>
        </Flex>
        {/* all the contents */}
        <Box bg="gray.100" flex={1} w="full" overflowX="hidden" overflowY={"auto"}>
          <Flex
            w="full"
            h="full"
            flexDirection="column"
            overflow="hidden"
            justify="center"
            align="center"
            p={3}
          >
            <Box
              p={[5, 10, 10, 10]}
              w="full"
              overflowX="hidden"
              overflowY={"auto"}
              h="full"
              bg="white"
              boxShadow="md"
              rounded={5}
            >
              {children}
            </Box>

            <Flex py={2} justify={"center"} align="center">
              <Heading size={"sm"} fontWeight="normal" color={"GrayText"}>
                {t("footer_text_primary")}{" "}
                <Link as={"a"} href="mailto:support@check2learn.com">
                  {t("footer_text_secondary")}
                </Link>{" "}
              </Heading>
            </Flex>
          </Flex>
        </Box>
      </VStack>
    </HStack>
  );
};

export default Dashboard;
