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
  Select,
} from "@chakra-ui/react";
import validator from "validator";
import { useDispatch } from "react-redux";
import { Alert, AlertIcon } from "@chakra-ui/alert";

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
  const [{ fName, lName, email, password, conPass, age, phone }, setInput] = useState({
    fName: "",
    lName: "",
    age: "",
    email: "",
    password: "",
    conPass: "",
    phone: "",
  });
  const [org, setOrg] = useState();
  const [processing, setProcessing] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConPass, setShowConPass] = useState(false);

  const dispatch = useDispatch();
  const toast = useToast();
  const history = useHistory();

  const ages = [
    "10 - 15 years",
    "16 - 20 years",
    "21 - 25 years",
    "26 - 30 years",
    "31 - 35 years",
    "36 - 40 years",
    "41 - 45 years",
    "46 - 50 years",
    "51 - 55 years",
    "56 - 60 years",
    "61 - 65 years",
    "66 - 70 years",
    "71 - 75 years ",
    "76 - 80 years",
    "> 81 years",
  ];

  const query = useQuery();

  const refererId = query.get("refererId");

  // for handling input change
  function HandleInputChange(event) {
    const { name, value } = event.target;

    setInput((pre) => ({ ...pre, [name]: value }));
  }

  // for validating the input infos after clicking on the button
  function ValidateInputInfo() {
    const { allFields, emailOk, passwordLength, passwordMatched, phoneOk } = {
      allFields: fName && lName && email && password && conPass && age,
      emailOk: validator.isEmail(email),
      phoneOk: validator.isMobilePhone(phone),
      passwordLength: password.length >= 8,
      passwordMatched: password === conPass,
    };

    if (!allFields) {
      toast({ status: "error", description: "Please fill all the fields properly" });
    } else if (!emailOk) {
      toast({ status: "error", description: "Your email is Invalid" });
    } else if (phone && !phoneOk) {
      toast({ status: "error", description: "Please make sure your phone number is valid" });
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
          age,
          email,
          password,
          referer: refererId,
          phone,
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

  // for fetching the details of the referer organization
  async function fetchOrgInfo(abortController) {
    try {
      const res = await fetch(`${config.serverURL}/get_auth/getRefererInfo/org/${refererId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        signal: abortController.signal,
      });
      const body = await res.json();
      if (res.ok) {
        setOrg(body.org);
      } else {
        toast({ status: "error", description: body.msg });
      }
    } catch (err) {
      toast({ status: "error", description: err.message });
    }
  }

  useEffect(() => {
    document.title = `${config.appName} - Register Account`;
  }, []);

  useEffect(() => {
    const abortController = new AbortController();
    if (refererId) {
      fetchOrgInfo(abortController);
    }
    return () => abortController.abort();
  }, [refererId]);

  return (
    <Flex h="full" justify="center" align="center">
      <Flex maxW="95%" w="450px" direction="column" p={10} bg="white" boxShadow="lg">
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
        <Select
          mb={3}
          placeholder="What is your age"
          onChange={HandleInputChange}
          name="age"
          value={age}
        >
          {ages.map((age, index) => {
            return (
              <option value={age} key={index}>
                {age}
              </option>
            );
          })}
        </Select>
        <InputField
          onChange={HandleInputChange}
          placeholder="WhatsApp number (optional)"
          name="phone"
          value={phone}
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
        >
          {processing ? "Processing..." : "Sign Up"}
        </Button>
        {org && refererId && (
          <Alert mt={3} rounded={5} status="info">
            <AlertIcon />
            You are being referred by {org.name}
          </Alert>
        )}
        <Text fontSize="md" mt={3} textAlign="center">
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
