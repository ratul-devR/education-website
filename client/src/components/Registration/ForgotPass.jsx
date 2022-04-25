import { useState } from "react";
import { Flex, Heading } from "@chakra-ui/layout";
import { Input } from "@chakra-ui/input";
import { Button } from "@chakra-ui/button";
import config from "../../config";
import useToast from "../../hooks/useToast";
import validator from "validator";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";

export default function ForgotPass() {
  const [email, setEmail] = useState("");
  const [processing, setProcessing] = useState(false);
  const toast = useToast();
  const { t } = useTranslation();
  const history = useHistory();

  async function getEmailForReset() {
    setProcessing(true);
    const res = await fetch(`${config.serverURL}/get_auth/resetPasswordSendEmail`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email }),
    });
    const body = await res.json();
    if (res.ok) {
      history.push("/auth");
      toast({ status: "success", description: t("forgot_password_success_snackbar") });
      setProcessing(false);
      setEmail("");
    } else {
      toast({ status: "error", description: body.msg });
      setProcessing(false);
    }
  }

  return (
    <Flex w="full" h="full" justify="center" direction="column" align="center">
      <Heading fontSize="2xl" fontWeight="normal" color="primary" mb={5}>
        {t("forgot_password_page_heading")}
      </Heading>
      <Input
        onChange={(e) => setEmail(e.target.value)}
        value={email}
        mb={3}
        placeholder={t("forgot_password_email_placeholder")}
        maxW="400px"
        type="email"
      />
      <Button
        disabled={!validator.isEmail(email) || processing}
        minW="400px"
        color="black"
        colorScheme="secondary"
        onClick={getEmailForReset}
      >
        {processing ? t("processing") : t("forgot_password_page_button")}
      </Button>
    </Flex>
  );
}
