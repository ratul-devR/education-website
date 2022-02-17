import { useEffect, useState } from "react";
import { Link as RouterLink, useHistory, useRouteMatch } from "react-router-dom";
import { Flex, Input, Heading, Button, Text, Link } from "@chakra-ui/react";
import { InputGroup, InputRightElement } from "@chakra-ui/input";
import validator from "validator";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";

import config from "../../config";

// hooks
import useToast from "../../hooks/useToast";

// actions
import { LOGIN } from "../../redux/actions/authActions";

const InputField = (props) => {
  return <Input {...props} mb={3} />;
};

const Login = () => {
  const [{ email, password }, setInput] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);

  const { path } = useRouteMatch();
  const toast = useToast();
  const dispatch = useDispatch();
  const history = useHistory();
  const { t } = useTranslation();

  // for handling input change
  function HandleInputChange(event) {
    const { name, value } = event.target;

    setInput((pre) => ({ ...pre, [name]: value }));
  }

  // for validating the input information's
  function ValidateInputInfo() {
    const { allFields, validEmail, validPassword } = {
      allFields: email && password,
      validEmail: validator.isEmail(email),
      validPassword: password.length >= 8,
    };

    if (!allFields) {
      toast({ status: "error", description: t("validation_all_field") });
    } else if (!validEmail) {
      toast({ status: "error", description: t("validation_valid_email") });
    } else if (!validPassword) {
      toast({ status: "error", description: t("validation_password") });
      // if everything goes ok, then it's time for server side validation
    } else if (allFields && validEmail && validPassword) {
      loginUser();
    }
  }

  // for logging in the user
  async function loginUser() {
    try {
      const res = await fetch(`${config.serverURL}/get_auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });
      const body = await res.json();

      if (res.ok && body.user) {
        dispatch(LOGIN(body.user));
        localStorage.setItem("token", JSON.stringify(body.token));
        history.push(body.user.role === "admin" ? "/admin" : "dashboard");
        toast({ status: "success", description: t("welcome_back") });
      } else if (res.status === 400) {
        toast({ status: "error", description: body.msg || "We have an error" });
      }
    } catch (err) {
      toast({ status: "error", description: err.message || "We are having unexpected errors" });
    }
  }

  useEffect(() => {
    document.title = `${config.appName} - Login`;
  }, []);

  return (
    <Flex h="full" justify="center" align="center">
      <Flex maxW="95%" w="450px" direction="column" p={10} bg="white" boxShadow="lg">
        <Heading textAlign="center" color="primary" fontWeight="normal" mb={5}>
          {t("sign_in")}
        </Heading>
        <InputField
          onChange={HandleInputChange}
          autoFocus
          placeholder={t("email_placeholder")}
          name="email"
          type="email"
          value={email}
        />
        <InputGroup size="md">
          <InputField
            onChange={HandleInputChange}
            placeholder={t("password_placeholder")}
            name="password"
            type={showPass ? "text" : "password"}
            value={password}
          />
          <InputRightElement w="4rem">
            <Button colorScheme="blue" onClick={() => setShowPass((pre) => !pre)} size="xs">
              {showPass ? "hide" : "show"}
            </Button>
          </InputRightElement>
        </InputGroup>
        <Button onClick={ValidateInputInfo} colorScheme="secondary" color="black" mb={3}>
          {t("sign_in")}
        </Button>
        <Text mb={2} fontSize="md" textAlign="center">
          {t("dont_have_an_account")}{" "}
          <Link color="primary" as={RouterLink} to={`${path}/register`}>
            {t("register")}
          </Link>
        </Text>
        <Text fontSize="md" textAlign="center">
          <Link color="primary" as={RouterLink} to={`${path}/forgotPass`}>
            {t("forgot_password")}
          </Link>
        </Text>
      </Flex>
    </Flex>
  );
};

export default Login;
