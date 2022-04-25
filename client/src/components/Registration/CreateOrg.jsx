import { Flex } from "@chakra-ui/layout";
import { Heading, Link as ChakraLink } from "@chakra-ui/react";
import { Input } from "@chakra-ui/input";
import { Checkbox } from "@chakra-ui/checkbox";
import { Select } from "@chakra-ui/select";
import { useEffect, useState } from "react";
import { Button } from "@chakra-ui/button";
import config from "../../config";
import useToast from "../../hooks/useToast";
import { Alert, AlertIcon } from "@chakra-ui/alert";
import validator from "validator";
import { Link, useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";
import { ORG_LOGIN } from "../../redux/actions/authActions";
import { useTranslation } from "react-i18next";

const InputField = (props) => {
  return <Input {...props} mb={3} bg="#fff" />;
};

const CreateOrg = () => {
  const [
    {
      name,
      email,
      password,
      conPass,
      streetAddress,
      city,
      postalCode,
      province,
      phone,
      type,
      yourName,
      yourPosition,
      subscribe,
    },
    setInput,
  ] = useState({
    name: "",
    email: "",
    password: "",
    conPass: "",
    streetAddress: "",
    city: "",
    postalCode: "",
    province: "",
    phone: "",
    type: "",
    yourName: "",
    yourPosition: "",
    subscribe: false,
  });
  const [processing, setProcessing] = useState(false);
  const [affiliateLink, setAffiliateLink] = useState("");
  const [registered, setRegistered] = useState();

  const toast = useToast();
  const dispatch = useDispatch();
  const history = useHistory();
  const { t } = useTranslation();

  function handleInputChange(event) {
    const { name, value } = event.target;
    setInput((pre) => ({
      ...pre,
      [name]: name === "subscribe" ? !subscribe : value,
    }));
  }

  function goToDashboard() {
    if (!registered) return;
    dispatch(ORG_LOGIN(registered));
    history.push("/orgDashboard");
  }

  async function registerOrg() {
    setProcessing(true);

    if (!validator.isEmail(email)) {
      toast({ status: "warning", description: t("validation_valid_email") });
      setProcessing(false);
    } else if (password !== conPass) {
      toast({ status: "warning", description: t("validation_password_match") });
    } else {
      try {
        const res = await fetch(`${config.serverURL}/get_auth/registerOrg`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            orgName: name,
            email,
            password,
            streetAddress,
            city,
            postalCode,
            province,
            phone,
            type,
            orgEmployeeName: yourName,
            orgEmployeePosition: yourPosition,
            subscribe,
          }),
        });
        const body = await res.json();

        if (res.ok) {
          toast({
            status: "info",
            description: t("register_org_success_snackbar"),
          });
          setRegistered(body.org);
          setProcessing(false);
          setAffiliateLink(body.affiliateLink);
        } else {
          toast({
            status: "error",
            description: body.msg || "Unexpected Error occurred",
          });
          setProcessing(false);
        }
      } catch (err) {
        toast({
          status: "error",
          description: err.message || "We are having an error",
        });
        setProcessing(false);
      }
    }
  }

  useEffect(() => {
    document.title = `${config.appName} - Register Organization`;
  }, []);

  return (
    <Flex w="full" align="center" direction="column" py={20}>
      <Flex boxShadow="md" mb={10} w="500px" bg="gray.50" p={10} direction="column" rounded={5}>
        <Heading color="primary" fontSize="2xl" fontWeight="normal" textAlign="center" mb={3}>
          {t("create_org")}
        </Heading>
        <InputField placeholder={t("name_of_your_org")} name="name" onChange={handleInputChange} />
        <InputField
          placeholder={t("email_placeholder")}
          name="email"
          onChange={handleInputChange}
        />
        <InputField
          placeholder={t("password_placeholder")}
          name="password"
          onChange={handleInputChange}
        />
        <InputField
          placeholder={t("confirm_password_placeholder")}
          onChange={handleInputChange}
          name="conPass"
        />
        <InputField
          placeholder={t("street_address")}
          name="streetAddress"
          onChange={handleInputChange}
        />
        <InputField placeholder={t("city")} name="city" onChange={handleInputChange} />
        <InputField placeholder={t("postal_code")} name="postalCode" onChange={handleInputChange} />
        <InputField placeholder={t("province")} name="province" onChange={handleInputChange} />
        <InputField placeholder={t("phone")} name="phone" onChange={handleInputChange} />
        <Select
          bg="#fff"
          mb={3}
          onChange={handleInputChange}
          name="type"
          placeholder={t("type_of_your_org")}
        >
          <option value="Escuela privada">Escuela privada</option>
          <option value="escuela concertada">escuela concertada</option>
          <option value="State school">{t("state_school")}</option>
          <option value="Academia">Academia</option>
          <option value="Centro de formación profesional">Centro de formación profesional</option>
          <option value="Other">{t("other")}</option>
        </Select>
        <InputField placeholder={t("your_name")} name="yourName" onChange={handleInputChange} />
        <InputField
          placeholder={t("your_position")}
          name="yourPosition"
          onChange={handleInputChange}
        />
        <Checkbox
          colorScheme="secondary"
          mb={3}
          onChange={handleInputChange}
          name="subscribe"
          defaultChecked={subscribe}
        >
          {t("subscribe_to_NL")}
        </Checkbox>
        {!registered ? (
          <Button
            disabled={
              !name ||
              !email ||
              !password ||
              !streetAddress ||
              !postalCode ||
              !province ||
              !phone ||
              !type ||
              !yourName ||
              !yourPosition ||
              processing
            }
            onClick={registerOrg}
            colorScheme="secondary"
            color="black"
          >
            {processing ? t("processing") : t("create_org")}
          </Button>
        ) : (
          <Button colorScheme="blue" onClick={goToDashboard}>
            {t("go_to_dashboard")}
          </Button>
        )}
        {affiliateLink && (
          <Alert mt={5} rounded={5} status="info">
            <AlertIcon />
            {t("here_is_your_afl")}: {affiliateLink}
          </Alert>
        )}
      </Flex>
      <Flex>
        {t("already_have_an_account")}{" "}
        <ChakraLink ml={2} color="primary" as={Link} textAlign="center" to="/auth/loginOrg">
          {t("sign_in_button")}
        </ChakraLink>
      </Flex>
    </Flex>
  );
};

export default CreateOrg;
