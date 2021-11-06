import { useEffect, useState } from "react";
import { Link as RouterLink, useHistory, useRouteMatch } from "react-router-dom";
import { Flex, Input, Heading, Button, Text, Link } from "@chakra-ui/react";
import validator from "validator";
import { useDispatch } from "react-redux";

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
  const { path } = useRouteMatch();
  const toast = useToast();
  const dispatch = useDispatch();
  const history = useHistory();

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
      toast({ status: "error", description: "Please fill the fields properly" });
    } else if (!validEmail) {
      toast({ status: "error", description: "Invalid Email" });
    } else if (!validPassword) {
      toast({ status: "error", description: "Invalid password" });
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
        history.push(body.user.role === "admin" ? "/admin" : "dashboard");
        toast({ status: "success", description: body.msg });
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
      <Flex maxW="95%" w="400px" direction="column" p={10} bg="white" boxShadow="lg">
        <Heading textAlign="center" color="primary" fontWeight="normal" mb={5}>
          Sign in
        </Heading>
        <InputField
          onChange={HandleInputChange}
          autoFocus
          placeholder="Enter your email"
          name="email"
          type="email"
          value={email}
        />
        <InputField
          onChange={HandleInputChange}
          placeholder="Enter your password"
          name="password"
          type="password"
          value={password}
        />
        <Button onClick={ValidateInputInfo} colorScheme="secondary" color="black" mb={3}>
          Sign in
        </Button>
        <Text fontSize="md" textAlign="center">
          Don't have an account?{" "}
          <Link color="primary" as={RouterLink} to={`${path}/register`}>
            Register
          </Link>
        </Text>
      </Flex>
    </Flex>
  );
};

export default Login;
