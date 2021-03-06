import { Grid, Flex, Container } from "@chakra-ui/layout";
import { Button } from "@chakra-ui/button";
import { Text } from "@chakra-ui/react";
import { Input, InputGroup, InputLeftAddon, InputRightAddon } from "@chakra-ui/input";
import { Table, Thead, Tbody, Tr, Th, Td, TableCaption } from "@chakra-ui/table";
import useLogout from "../hooks/useLogout";
import Logo from "../assets/logo.png";
import CopyToClipBoard from "react-copy-to-clipboard";
import { useEffect } from "react";
import config from "../config";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

export default function OrgDashboard() {
  const org = JSON.parse(localStorage.getItem("org"));
  const { appSubTitle } = useSelector((state) => state.settingsReducer);
  const { t } = useTranslation();
  const logout = useLogout();
  useEffect(() => {
    document.title = `${config.appName} - Organization Dashboard`;
  }, []);
  return (
    <Grid templateRows="80px 1fr" w="full" h="full" direction="column">
      <Flex as="nav" boxShadow="sm" justify="space-between" py={5} px={10} align="center">
        <Flex direction="column" justify="center" align="center">
          <img style={{ display: "block", width: "150px" }} alt="check2learn logo" src={Logo} />
          {appSubTitle && <Text>{appSubTitle}</Text>}
        </Flex>
        <Button onClick={logout} colorScheme="blue">
          {t("logout")}
        </Button>
      </Flex>
      <Container maxW="container.xl" py={10}>
        <InputGroup size="lg" mb={10}>
          <InputLeftAddon>{t("affiliate_link")}</InputLeftAddon>
          <Input readOnly value={org.affiliateLink} />
          <CopyToClipBoard text={org.affiliateLink}>
            <Button colorScheme="blue" cursor="pointer" as={InputRightAddon}>
              {t("copy_link")}
            </Button>
          </CopyToClipBoard>
        </InputGroup>
        <Table variant="simple">
          <TableCaption>
            {t("users_you_have_referred")} ({org.refers.length})
          </TableCaption>
          <Thead>
            <Tr>
              <Th>First Name</Th>
              <Th>Last Name</Th>
              <Th>email</Th>
              <Th>phone</Th>
            </Tr>
          </Thead>
          <Tbody>
            {org.refers.length > 0 ? (
              org.refers.map((user) => {
                return (
                  <Tr>
                    <Td>{user.firstName}</Td>
                    <Td>{user.lastName}</Td>
                    <Td>{user.email}</Td>
                    <Td>{user.phone ? user.phone : "Not Provided"}</Td>
                  </Tr>
                );
              })
            ) : (
              <Tr>
                <Td textAlign="center" fontSize="2xl" p={10} color="GrayText" colSpan={4}>
                  {t("no_refers_yet")}
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Container>
    </Grid>
  );
}
