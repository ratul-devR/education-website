import { useState } from "react";
import { Flex, Heading } from "@chakra-ui/layout";
import { Input } from "@chakra-ui/input";
import { Button } from "@chakra-ui/button";
import config from "../../config";
import useToast from "../../hooks/useToast";
import { useParams, useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function ResetPass() {
  const [state, setState] = useState({
    password: "",
    conPassword: "",
  });
  const [processing, setProcessing] = useState(false);
  const toast = useToast();
  const { userId } = useParams();
  const history = useHistory();
  const { t } = useTranslation();

  function handleInputChange(e) {
    const { name, value } = e.target;
    setState((pre) => ({ ...pre, [name]: value }));
  }

  async function resetPassword() {
    setProcessing(true);
    const res = await fetch(`${config.serverURL}/get_auth/resetPassword/${userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ password: state.password }),
    });
    const body = await res.json();
    if (res.ok) {
      history.push("/auth");
      toast({ status: "success", description: t("reset_password_success_snackbar") });
      setProcessing(false);
    } else {
      toast({ status: "error", description: body.msg });
      setProcessing(false);
    }
  }

  return (
    <Flex w="full" h="full" justify="center" align="center" direction="column">
      <Heading mb={5} color="primary" fontWeight="normal" fontSize="2xl">
        {t("reset_password_page_heading")}
      </Heading>
      <Input
        maxW="400px"
        onChange={handleInputChange}
        name="password"
        placeholder={t("reset_password_password_placeholder")}
        mb={3}
      />
      <Input
        maxW="400px"
        placeholder={t("reset_password_conPass_placeholder")}
        onChange={handleInputChange}
        name="conPassword"
        mb={3}
      />
      <Button
        onClick={resetPassword}
        disabled={
          processing ||
          !state.password ||
          !state.conPassword ||
          state.password.length < 8 ||
          state.password !== state.conPassword
        }
        minW="400px"
        colorScheme="secondary"
        color="black"
      >
        {processing ? t("processing") : t("reset_password_page_button")}
      </Button>
    </Flex>
  );
}
