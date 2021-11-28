import { useEffect, useState } from "react";
import { Link as RouterLink, useHistory, useLocation } from "react-router-dom";
import {
  Flex,
  Heading,
  Button,
  Input,
  Text,
  Link,
  InputGroup,
  InputRightElement,
} from "@chakra-ui/react";
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

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const Register = () => {
  const [{ fName, lName, email, password, conPass }, setInput] = useState({
    fName: "",
    lName: "",
    email: "",
    password: "",
    conPass: "",
  });
  const [processing, setProcessing] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConPass, setShowConPass] = useState(false);

  const dispatch = useDispatch();
  const toast = useToast();
  const history = useHistory();

  const query = useQuery();

  const refererId = query.get("refererId");

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
    setProcessing(true);
    try {
      const res = await fetch(`${config.serverURL}/get_auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: fName,
          lastName: lName,
          email,
          password,
          referer: refererId,
        }),
        credentials: "include",
      });
      const body = await res.json();

      if (res.ok) {
        setProcessing(false);
        dispatch(LOGIN(body.user));
        history.push("/dashboard");
        toast({ status: "success", description: body.msg });
      } else if (res.status === 400) {
        setProcessing(false);
        toast({ status: "error", description: body.msg || "Something is wrong in our end" });
      }
    } catch (err) {
      setProcessing(false);
      toast({ status: "error", description: err.message || "There was an unexpected error" });
    }
  }

  useEffect(() => {
    document.title = `${config.appName} - Register Account`;
  }, []);

  return (
    <Flex h="full" justify="center" align="center">
      <Flex maxW="95%" w="400px" direction="column" p={10} bg="white" boxShadow="lg">
        <Heading textAlign="center" color="primary" fontWeight="normal" mb={5}>
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
        <InputGroup size="md">
          <InputField
            onChange={HandleInputChange}
            placeholder="Enter your password"
            name="password"
            type={showPass ? "text" : "password"}
            value={password}
          />
          <InputRightElement w="4rem">
            <Button onClick={() => setShowPass((pre) => !pre)} colorScheme="blue" size="xs">
              {showPass ? "hide" : "show"}
            </Button>
          </InputRightElement>
        </InputGroup>
        <InputGroup size="md">
          <InputField
            onChange={HandleInputChange}
            placeholder="Confirm password"
            name="conPass"
            type={showConPass ? "text" : "password"}
            value={conPass}
          />
          <InputRightElement w="4rem">
            <Button onClick={() => setShowConPass((pre) => !pre)} colorScheme="blue" size="xs">
              {showConPass ? "hide" : "show"}
            </Button>
          </InputRightElement>
        </InputGroup>
        <Button
          disabled={processing}
          onClick={ValidateInputInfo}
          colorScheme="secondary"
          color="black"
          mb={3}
        >
          {processing ? "Processing..." : "Sign Up"}
        </Button>
        <Text fontSize="md" textAlign="center">
          Already have an account?{" "}
          <Link color="primary" as={RouterLink} to="/auth">
            Login
          </Link>
        </Text>
      </Flex>
    </Flex>
  );
};

export default Register;
