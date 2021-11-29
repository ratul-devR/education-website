import { Flex, Heading } from "@chakra-ui/layout";
import { Input, InputGroup, InputRightElement } from "@chakra-ui/input";
import { Button } from "@chakra-ui/button";
import { useState } from "react";
import config from "../config";

export default function LoginOrg() {
  const [input, setInput] = useState({
    email: "",
    password: "",
  });
  const [showPass, setShowPass] = useState(false);
  function handleInputChange(e) {
    const { name, value } = e.target;
    setInput((pre) => ({ ...pre, [name]: value }));
  }
  function loginOrg() {
    const res = await fetch(`${config.serverURL}/get_auth/`);
  }
  return (
    <Flex w="full" h="full" justify="center" align="center">
      <Flex w="100%" maxW="400px" direction="column" p={10} rounded={5} boxShadow="lg">
        <Heading textAlign="center" fontSize="2xl" color="primary" fontWeight="normal" mb={5}>
          Org Login
        </Heading>
        <Input
          placeholder="Enter your email"
          mb={3}
          name="email"
          onChange={handleInputChange}
          value={input.email}
        />
        <InputGroup mb={3}>
          <Input
            onChange={handleInputChange}
            value={input.password}
            name="password"
            type={showPass ? "text" : "password"}
            placeholder="Enter your Password"
          />
          <InputRightElement w="4rem">
            <Button onClick={() => setShowPass((pre) => !pre)} size="xs" colorScheme="blue">
              {showPass ? "hide" : "show"}
            </Button>
          </InputRightElement>
        </InputGroup>
        <Button onClick={loginOrg} colorScheme="secondary" color="black">
          Sign in
        </Button>
      </Flex>
    </Flex>
  );
}
