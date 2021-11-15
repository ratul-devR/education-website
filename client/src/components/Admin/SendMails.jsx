import { Flex, Heading } from "@chakra-ui/layout";
import { Input } from "@chakra-ui/input";
import { Textarea } from "@chakra-ui/textarea";
import { Button } from "@chakra-ui/button";
import { useState } from "react";
import useToast from "../../hooks/useToast";
import config from "../../config";

const SendMails = () => {
  const [{ subject, email }, setInput] = useState({
    subject: "",
    email: "",
  });
  const toast = useToast();

  function HandleInputChange(e) {
    const { name, value } = e.target;
    setInput((pre) => ({ ...pre, [name]: value }));
  }

  async function sendMails() {
    try {
      const res = await fetch(`${config.serverURL}/get_admin/sendMails`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ subject, email }),
      });
      const body = await res.json();

      if (res.ok) {
        setInput({ email: "", subject: "" });
        toast({ status: "success", description: body.msg });
      } else {
        toast({ status: "error", description: body.msg });
      }
    } catch (err) {
      toast({ status: "error", description: err.message });
    }
  }

  return (
    <Flex w="full" h="full" direction="column" align="center">
      <Heading mb={5} textAlign="center" fontSize="2xl" fontWeight="normal" color="primary">
        Send Mail to organizations
      </Heading>
      <Flex
        w="100%"
        border="1px solid"
        borderColor="gray.100"
        maxW="550px"
        p={10}
        rounded={5}
        boxShadow="md"
        direction="column"
      >
        <Input
          value={subject}
          onChange={HandleInputChange}
          name="subject"
          placeholder="Subject"
          mb={3}
        />
        <Textarea
          value={email}
          onChange={HandleInputChange}
          name="email"
          rows={10}
          placeholder="Your email"
          mb={3}
        />
        <Button
          onClick={sendMails}
          disabled={!subject || !email}
          colorScheme="secondary"
          color="black"
        >
          Send Mail To All The Organizations
        </Button>
      </Flex>
    </Flex>
  );
};

export default SendMails;
