import { Flex } from "@chakra-ui/layout";
import { Heading } from "@chakra-ui/react";
import { Input } from "@chakra-ui/input";
import { Select } from "@chakra-ui/select";
import { useState } from "react";
import { Button } from "@chakra-ui/button";
import config from "../config";
import { Checkbox } from "@chakra-ui/checkbox";
import useToast from "../hooks/useToast";

const InputField = (props) => {
  return <Input {...props} mb={3} bg="#fff" />;
};

const CreateOrg = () => {
  const [
    {
      name,
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
  const toast = useToast();

  function handleInputChange(event) {
    const { name, value } = event.target;
    setInput((pre) => ({ ...pre, [name]: name === "subscribe" ? !subscribe : value }));
  }

  async function registerOrg() {
    try {
      const res = await fetch(`${config.serverURL}/get_auth/registerOrg`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          orgName: name,
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
          description: `Here is your affiliate link > ${body.affiliateLink}`,
          duration: 60000,
        });
      } else {
        toast({ status: "error", description: body.msg || "Unexpected Error occurred" });
      }
    } catch (err) {
      toast({ status: "error", description: err.message || "We are having an error" });
    }
  }

  return (
    <Flex w="full" justify="center" py={20}>
      <Flex boxShadow="md" w="450px" bg="gray.50" p={10} direction="column" rounded={5}>
        <Heading color="primary" fontSize="2xl" fontWeight="normal" textAlign="center" mb={3}>
          Create Organization
        </Heading>
        <InputField placeholder="Name of your org" name="name" onChange={handleInputChange} />
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
        <Button
          disabled={
            !name ||
            !streetAddress ||
            !postalCode ||
            !province ||
            !phone ||
            !type ||
            !yourName ||
            !yourPosition
          }
          onClick={registerOrg}
          colorScheme="secondary"
          color="black"
        >
          Register Organization
        </Button>
      </Flex>
    </Flex>
  );
};

export default CreateOrg;
