import { Flex, Heading } from "@chakra-ui/layout";
import { Input, InputGroup, InputRightElement } from "@chakra-ui/input";
import { Button } from "@chakra-ui/button";
import { useState } from "react";
import config from "../../config";
import useToast from "../../hooks/useToast";
import { useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";
import { ORG_LOGIN } from "../../redux/actions/authActions";
import { Link } from "react-router-dom";
import { Link as ChakraLink } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";

export default function LoginOrg() {
  const [input, setInput] = useState({
    email: "",
    password: "",
  });
  const [showPass, setShowPass] = useState(false);
  const toast = useToast();
  const history = useHistory();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  function handleInputChange(e) {
    const { name, value } = e.target;
    setInput((pre) => ({ ...pre, [name]: value }));
  }
  async function loginOrg() {
    try {
      const res = await fetch(`${config.serverURL}/get_auth/loginOrg`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: input.email, password: input.password }),
      });
      const body = await res.json();
      if (res.ok) {
        dispatch(ORG_LOGIN(body.org));
        localStorage.setItem("token", JSON.stringify(body.token));
        history.push("/orgDashboard");
        toast({ status: "success", description: body.msg });
      } else {
        toast({ status: "error", description: body.msg });
      }
    } catch (err) {
      toast({ status: "error", description: err.message });
    }
  }
  return (
    <Flex w="full" h="full" justify="center" align="center">
      <Flex w="100%" maxW="450px" direction="column" p={10} rounded={5} boxShadow="lg">
        <Heading textAlign="center" fontSize="2xl" color="primary" fontWeight="normal" mb={5}>
          {t("sign_in")}
        </Heading>
        <Input
          placeholder={t("email_placeholder")}
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
            placeholder={t("password_placeholder")}
          />
          <InputRightElement w="4rem">
            <Button onClick={() => setShowPass((pre) => !pre)} size="xs" colorScheme="blue">
              {showPass ? "hide" : "show"}
            </Button>
          </InputRightElement>
        </InputGroup>
        <Button mb={5} onClick={loginOrg} colorScheme="secondary" color="black">
          {t("sign_in")}
        </Button>
        <Flex justify="center">
          {t("dont_have_an_account")}?{" "}
          <ChakraLink ml={2} color="primary" as={Link} textAlign="center" to="/auth/createOrg">
            {t("register")}
          </ChakraLink>
        </Flex>
      </Flex>
    </Flex>
  );
}
