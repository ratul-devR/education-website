import { Grid, Flex, Container, SimpleGrid, GridItem, Heading, Text } from "@chakra-ui/layout";
import { Button } from "@chakra-ui/button";
import useLogout from "../hooks/useLogout";
import Logo from "../assets/logo.png";
import { useSelector } from "react-redux";
import CopyToClipBoard from "react-copy-to-clipboard";

export default function OrgDashboard() {
  const { org } = useSelector((state) => state.authReducer);
  const logout = useLogout();
  if (!org.peoples) return <div></div>;
  return (
    <Grid templateRows="60px 1fr" w="full" h="full" direction="column">
      <Flex as="nav" boxShadow="sm" justify="space-around" align="center">
        <img style={{ display: "block", width: "150px" }} alt="check2learn logo" src={Logo} />
        <Button onClick={logout} colorScheme="blue">
          Log Out
        </Button>
      </Flex>
      <Container maxW="container.xl" py={10}>
        <SimpleGrid columns={[1, 1, 2, 2]} spacing={3}>
          <GridItem
            textAlign="center"
            border="1px solid"
            borderColor="gray.100"
            boxShadow="md"
            p={10}
          >
            <Heading fontSize="2xl" fontWeight="normal" mb={5} color="GrayText">
              Total Redirects
            </Heading>
            <Heading fontSize="5xl" color="primary">
              {org.refers.length}
            </Heading>
          </GridItem>
          <GridItem
            textAlign="center"
            border="1px solid"
            borderColor="gray.100"
            boxShadow="md"
            p={10}
          >
            <Heading fontSize="2xl" fontWeight="normal" mb={5} color="GrayText">
              Total Employyes
            </Heading>
            <Heading fontSize="5xl" color="primary">
              {org.peoples.length}
            </Heading>
          </GridItem>
        </SimpleGrid>
        <Flex direction="column">
          <Heading fontSize="1xl" fontWeight="normal" mt={10}>
            Affiliate Link:{" "}
            <Text display="inline-block" color="primary">
              {org.affiliateLink}
            </Text>
          </Heading>
          <CopyToClipBoard text={org.affiliateLink}>
            <Button mt={5} w="100px" display="inline-block" colorScheme="secondary" color="black">
              Copy
            </Button>
          </CopyToClipBoard>
        </Flex>
      </Container>
    </Grid>
  );
}
