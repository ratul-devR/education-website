import { Flex, Heading } from "@chakra-ui/layout";

const NoMessage = ({ message }) => {
  return (
    <Flex w="full" minH="50vh" h="full" justify="center" align="center">
      <Heading fontWeight="normal" fontSize="2xl" textAlign="center" color="GrayText">
        {message}
      </Heading>
    </Flex>
  );
};

export default NoMessage;
