import { Grid, Flex, Container } from "@chakra-ui/layout";
import { Button } from "@chakra-ui/button";
import { Input, InputGroup, InputLeftAddon, InputRightAddon } from "@chakra-ui/input";
import { Table, Thead, Tbody, Tfoot, Tr, Th, Td, TableCaption } from "@chakra-ui/table";
import useLogout from "../hooks/useLogout";
import Logo from "../assets/logo.png";
import CopyToClipBoard from "react-copy-to-clipboard";

export default function OrgDashboard() {
  const org = JSON.parse(localStorage.getItem("org"));
  const logout = useLogout();
  return (
    <Grid templateRows="60px 1fr" w="full" h="full" direction="column">
      <Flex as="nav" boxShadow="sm" justify="space-between" px={10} align="center">
        <img style={{ display: "block", width: "150px" }} alt="check2learn logo" src={Logo} />
        <Button onClick={logout} colorScheme="blue">
          Log Out
        </Button>
      </Flex>
      <Container maxW="container.xl" py={10}>
        <InputGroup size="lg" mb={10}>
          <InputLeftAddon>Affiliate Link</InputLeftAddon>
          <Input readOnly value={org.affiliateLink} />
          <CopyToClipBoard text={org.affiliateLink}>
            <Button colorScheme="blue" cursor="pointer" as={InputRightAddon}>
              Copy Link
            </Button>
          </CopyToClipBoard>
        </InputGroup>
        <Table variant="simple">
          <TableCaption>Users you have referred ({org.refers.length})</TableCaption>
          <Thead>
            <Tr>
              <Th>First Name</Th>
              <Th>Last Name</Th>
              <Th>email</Th>
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
                  </Tr>
                );
              })
            ) : (
              <Tr>
                <Td textAlign="center" fontSize="2xl" p={10} color="GrayText" colSpan={3}>
                  No Refers Yet
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Container>
    </Grid>
  );
}
