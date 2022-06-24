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
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

  const ages = [
    "10 - 15",
    "16 - 20",
    "21 - 25",
    "26 - 30",
    "31 - 35",
    "36 - 40",
    "41 - 45",
    "46 - 50",
    "51 - 55",
    "56 - 60",
    "61 - 65",
    "66 - 70",
    "71 - 75",
    "76 - 80",
    "> 81",
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
    const { allFields, emailOk, passwordLength, phoneOk, passwordMatched } = {
      allFields: fName && lName && email && password && conPass && age,
      emailOk: validator.isEmail(email),
      phoneOk: validator.isMobilePhone(phone),
      passwordLength: password.length >= 8,
      passwordMatched: password === conPass,
    };

    if (!allFields) {
      toast({ status: "error", description: t("validation_all_field") });
    } else if (!emailOk) {
      toast({ status: "error", description: t("validation_valid_email") });
    } else if (phone && !phoneOk) {
      toast({ status: "error", description: t("validation_phone_number") });
    } else if (!passwordLength) {
      toast({ status: "error", description: t("validation_password_length") });
    } else if (!passwordMatched) {
      toast({ status: "error", description: t("validation_password_length") });
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
          phone: phone ? phone : null,
        }),
        credentials: "include",
      });
      const body = await res.json();

      if (res.ok) {
        setProcessing(false);
        dispatch(LOGIN(body.user));
        localStorage.setItem("token", JSON.stringify(body.token));
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
  async function fetchOrgInfo() {
    try {
      const res = await fetch(`${config.serverURL}/get_auth/getRefererInfo/org/${refererId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
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
    if (refererId) {
      fetchOrgInfo();
    }
  }, [refererId]);

  return (
    <Flex justify="center" align="center">
      <Flex maxW="95%" w="450px" direction="column" p={10} bg="white" boxShadow="lg">
        <Heading textAlign="center" color="primary" fontWeight="normal" mb={5}>
          {t("register")}
        </Heading>
        <InputField
          onChange={HandleInputChange}
          placeholder={t("fName_placeholder")}
          name="fName"
          type="text"
          autoFocus
          value={fName}
        />
        <InputField
          onChange={HandleInputChange}
          placeholder={t("lName_placeholder")}
          name="lName"
          type="text"
          value={lName}
        />
        <Select
          mb={3}
          placeholder={t("what_is_your_age")}
          onChange={HandleInputChange}
          name="age"
          value={age}
        >
          {ages.map((age, index) => {
            return (
              <option value={age} key={index}>
                {age} {t("years")}
              </option>
            );
          })}
        </Select>
        <InputField
          onChange={HandleInputChange}
          placeholder={t("WA_number_placeholder")}
          name="phone"
          value={phone}
        />
        <InputField
          onChange={HandleInputChange}
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
            <Button onClick={() => setShowPass((pre) => !pre)} colorScheme="blue" size="xs">
              {showPass ? t("passwordButtonHide") : t("passwordButtonShow")}
            </Button>
          </InputRightElement>
        </InputGroup>
        <InputGroup size="md">
          <InputField
            onChange={HandleInputChange}
            placeholder={t("confirm_password_placeholder")}
            name="conPass"
            type={showConPass ? "text" : "password"}
            value={conPass}
          />
          <InputRightElement w="4rem">
            <Button onClick={() => setShowConPass((pre) => !pre)} colorScheme="blue" size="xs">
              {showConPass ? t("passwordButtonHide") : t("passwordButtonShow")}
            </Button>
          </InputRightElement>
        </InputGroup>
        <Button
          disabled={processing}
          onClick={ValidateInputInfo}
          colorScheme="secondary"
          color="black"
        >
          {processing ? t("processing") : t("register")}
        </Button>
        {org && refererId && (
          <Alert mt={3} rounded={5} status="info">
            <AlertIcon />
            {org.name} {t("you_are_being_referred_by")}
          </Alert>
        )}
        <Text fontSize="md" mt={3} textAlign="center">
          {t("already_have_an_account")}{" "}
          <Link color="primary" as={RouterLink} to="/auth">
            {t("sign_in")}
          </Link>
        </Text>
      </Flex>
    </Flex>
  );
};

export default Register;
