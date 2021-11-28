import { Flex } from "@chakra-ui/layout";
import { Heading } from "@chakra-ui/react";
import { Input } from "@chakra-ui/input";
import { Checkbox } from "@chakra-ui/checkbox";
import { Select } from "@chakra-ui/select";
import { useEffect, useState } from "react";
import { Button } from "@chakra-ui/button";
import config from "../config";
import useToast from "../hooks/useToast";
import { Alert, AlertIcon } from "@chakra-ui/alert";
import validator from "validator";

const InputField = (props) => {
  return <Input {...props} mb={3} bg="#fff" />;
};

const CreateOrg = () => {
  const [
    {
      name,
      email,
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
  const [addPeople, setAddPeople] = useState(false);
  const [colleagues, setColleagues] = useState([]);
  const [affiliateLink, setAffiliateLink] = useState("");

  const toast = useToast();

  function handleInputChange(event) {
    const { name, value } = event.target;
    setInput((pre) => ({ ...pre, [name]: name === "subscribe" ? !subscribe : value }));
  }

  async function registerOrg() {
    setProcessing(true);

    if (!validator.isEmail(email)) {
      toast({ status: "warning", description: "Your email is invalid" });
      setProcessing(false);
    } else {
      try {
        const res = await fetch(`${config.serverURL}/get_auth/registerOrg`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            orgName: name,
            email,
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
            description: body.msg,
          });
          setProcessing(false);
          setAffiliateLink(body.affiliateLink);
        } else {
          toast({ status: "error", description: body.msg || "Unexpected Error occurred" });
          setProcessing(false);
        }
      } catch (err) {
        toast({ status: "error", description: err.message || "We are having an error" });
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
          Create Organization
        </Heading>
        <InputField placeholder="Name of your org" name="name" onChange={handleInputChange} />
        <InputField placeholder="Email" name="email" onChange={handleInputChange} />
        <InputField
          placeholder="Street Address"
          name="streetAddress"
          onChange={handleInputChange}
        />
        <InputField placeholder="City" name="city" onChange={handleInputChange} />
        <InputField placeholder="Postal Code" name="postalCode" onChange={handleInputChange} />
        <InputField placeholder="Province" name="province" onChange={handleInputChange} />
        <InputField placeholder="Phone" name="phone" onChange={handleInputChange} />
        <Select
          bg="#fff"
          mb={3}
          onChange={handleInputChange}
          name="type"
          placeholder="Type of your organization"
        >
          <option value="Escuela privada">Escuela privada</option>
          <option value="escuela concertada">escuela concertada</option>
          <option value="State school">State school</option>
          <option value="Academia">Academia</option>
          <option value="Centro de formación profesional">Centro de formación profesional</option>
          <option value="Other">Other</option>
        </Select>
        <InputField placeholder="Your name" name="yourName" onChange={handleInputChange} />
        <InputField placeholder="Your Position" name="yourPosition" onChange={handleInputChange} />
        <Checkbox
          colorScheme="secondary"
          mb={3}
          onChange={handleInputChange}
          name="subscribe"
          defaultChecked={subscribe}
        >
          Subscribe to Newsletter
        </Checkbox>
        <Checkbox onChange={() => setAddPeople((pre) => !pre)} mb={3} colorScheme="secondary">
          Add Colleagues
        </Checkbox>
        <Button
          disabled={
            !name ||
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
          {processing ? "Processing..." : "Register Organization"}
        </Button>
        {affiliateLink && (
          <Alert mt={5} rounded={5} status="info">
            <AlertIcon />
            Here is your affiliate link: {affiliateLink}
          </Alert>
        )}
      </Flex>

      {/* for the people from organization */}
      {addPeople && (
        <Flex w="500px" justify="center" direction="column" bg="gray.50" p={10} boxShadow="md">
          <Heading textAlign="center" mb={5} fontWeight="normal" fontSize="2xl" color="primary">
            Add Colleagues
          </Heading>
          <Input placeholder="Enter Colleague Name" />
        </Flex>
      )}
    </Flex>
  );
};

export default CreateOrg;
