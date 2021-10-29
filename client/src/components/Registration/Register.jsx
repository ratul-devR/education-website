import { useEffect, useState } from "react";
import { Link as RouterLink, useHistory, useRouteMatch } from "react-router-dom";
import { Flex, Heading, Button, Input, Text, Link } from "@chakra-ui/react";
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

const Register = () => {
  const [{ fName, lName, email, password, conPass }, setInput] = useState({
    fName: "",
    lName: "",
    email: "",
    password: "",
    conPass: "",
  });
  const { path } = useRouteMatch();
  const dispatch = useDispatch();
  const toast = useToast();
  const history = useHistory();

  // for handling input change
  function HandleInputChange(event) {
    const { name, value } = event.target;

    setInput((pre) => ({ ...pre, [name]: value }));
  }

  // for validating the input infos after clicking on the button
  function ValidateInputInfo() {
    const { allFields, emailOk, passwordLength, passwordMatched } = {
      allFields: fName && lName && email && password && conPass,
      emailOk: validator.isEmail(email),
      passwordLength: password.length >= 8,
      passwordMatched: password === conPass,
    };

    if (!allFields) {
      toast({ status: "error", description: "Please fill all the fields properly" });
    } else if (!emailOk) {
      toast({ status: "error", description: "Your email is Invalid" });
    } else if (!passwordLength) {
      toast({ status: "error", description: "password must contain 8 chars" });
    } else if (!passwordMatched) {
      toast({ status: "error", description: "password doesn't matched" });
    } else if (allFields && emailOk && passwordLength && passwordMatched) {
      createUser();
    }
  }

  // for sending the data to the server and creating a new user
  async function createUser() {
    try {
      const res = await fetch(`${config.serverURL}/get_auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName: fName, lastName: lName, email, password }),
        credentials: "include",
      });
      const body = await res.json();

      if (res.ok) {
        dispatch(LOGIN(body.user));
        history.push("/dashboard");
        toast({ status: "success", description: body.msg });
      } else if (res.status === 400) {
        toast({ status: "error", description: body.msg || "Something is wrong in our end" });
      }
    } catch (err) {
      toast({ status: "error", description: err.message || "There was an unexpected error" });
    }
  }

  useEffect(() => {
    document.title = `${config.appName} - Register Account`;
  }, []);

  return (
    <Flex h="full" justify="center" align="center">
      <Flex maxW="95%" w="400px" direction="column" p={10} bg="white" boxShadow="lg">
        <Heading textAlign="center" color="teal" fontWeight="normal" mb={5}>
          Sign up
        </Heading>
        <InputField
          onChange={HandleInputChange}
          placeholder="First name"
          name="fName"
          type="text"
          autoFocus
          value={fName}
        />
        <InputField
          onChange={HandleInputChange}
          placeholder="Last Name"
          name="lName"
          type="text"
          value={lName}
        />
        <InputField
          onChange={HandleInputChange}
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
        <InputField
          onChange={HandleInputChange}
          placeholder="Confirm password"
          name="conPass"
          type="password"
          value={conPass}
        />
        <Button onClick={ValidateInputInfo} colorScheme="teal" mb={3}>
          Sign in
        </Button>
        <Text fontSize="md" textAlign="center">
          Already have an account?{" "}
          <Link color="teal" as={RouterLink} to="/auth">
            Login
          </Link>
        </Text>
      </Flex>
    </Flex>
  );
};

export default Register;
