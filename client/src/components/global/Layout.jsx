import { VStack, Flex } from "@chakra-ui/react";
import Nav from "./Nav";

const Layout = ({ children }) => {
  return (
    <VStack h="100vh" overflow="hidden" spacing={0}>
      <Nav />
      <Flex direction="column" overflowX="hidden" h="full" w="full">
        {children}
      </Flex>
    </VStack>
  );
};

export default Layout;
