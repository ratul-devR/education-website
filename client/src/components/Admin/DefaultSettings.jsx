import { useEffect, useState } from "react";
import { Flex, Heading } from "@chakra-ui/layout";
import { Text } from "@chakra-ui/react";
import { Input } from "@chakra-ui/input";
import { Button } from "@chakra-ui/button";
import { FormLabel as Label } from "@chakra-ui/form-control";
import useToast from "../../hooks/useToast";
import { Textarea } from "@chakra-ui/textarea";
import config from "../../config";
import { Spinner } from "@chakra-ui/spinner";
import { useDispatch } from "react-redux";
import { FETCH_AND_UPDATE_SETTINGS } from "../../redux/actions/settingsActions";
import { Select } from "@chakra-ui/select";
import { useTranslation } from "react-i18next";

export default function DefaultSettings() {
  const [
    {
      appSubTitle,
      _id,
      lang,
      notificationTimeSpan,
      reminderMessage,
      requestMessage,
      reminderDuration,
      emailConfirmationMessage,
      resetPasswordMessage,
      affiliateLinkMessage,
    },
    setInput,
  ] = useState({
    appSubTitle: "",
    lang: "",
    notificationTimeSpan: "",
    reminderMessage: "",
    requestMessage: "",
    reminderDuration: "",
    emailConfirmationMessage: "",
    resetPasswordMessage: "",
    affiliateLinkMessage: "",
  });
  const [languages] = useState({
    en: "en-US",
    es: "es",
  });
  const [newSettings, editSettings] = ["newSettings", "editSettings"];
  const [processing, setProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [path, setPath] = useState(newSettings);
  const { i18n } = useTranslation();
  const toast = useToast();
  const dispatch = useDispatch();

  async function fetchSettings() {
    try {
      const res = await fetch(`${config.serverURL}/get_settings`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const body = await res.json();
      if (res.ok) {
        setLoading(false);
        setInput((pre) => ({ ...pre, ...body.settings }));
        setPath(editSettings);
      } else if (res.status === 404) {
        setLoading(false);
      } else {
        toast({ status: "error", description: body.msg });
      }
    } catch (err) {
      toast({ status: "error", description: err.message });
    }
  }

  function handleInputChange(e) {
    const { name, value } = e.target;
    setInput((pre) => ({ ...pre, [name]: value }));
  }

  async function handleClick() {
    setProcessing(true);
    try {
      const res = await fetch(
        `${config.serverURL}/get_settings/${path}${path === editSettings ? "/" + _id : ""}`,
        {
          method: path === "editSettings" ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            appSubTitle,
            lang,
            notificationTimeSpan,
            requestMessage,
            reminderMessage,
            reminderDuration,
            emailConfirmationMessage,
            resetPasswordMessage,
            affiliateLinkMessage,
          }),
        }
      );
      const body = await res.json();
      if (res.ok) {
        dispatch(FETCH_AND_UPDATE_SETTINGS(body.settings));
        if (body.settings.lang) {
          i18n.changeLanguage(body.settings.lang);
          localStorage.setItem("locale", JSON.stringify(body.settings.lang));
        }
        toast({ status: "success", description: body.msg });
        setPath(editSettings);
        setProcessing(false);
      } else {
        toast({ status: "error", description: body.msg });
        setProcessing(false);
      }
    } catch (err) {
      toast({ status: "error", description: err.message });
      setProcessing(false);
    }
  }

  useEffect(() => {
    fetchSettings();
  }, []);

  if (loading) {
    return (
      <Flex w="full" h="full" direction="column" justify="center" align="center">
        <Spinner />
      </Flex>
    );
  }

  return (
    <Flex w="full" maxW="700px" h="auto" alignSelf="center" direction="column">
      <Heading color="primary" mb={3} fontWeight="normal" fontSize="2xl">
        Default Settings
      </Heading>
      <Text color="GrayText" mb={10}>
        Some handy settings
      </Text>
      <Label mb={2}>Application Subtitle</Label>
      <Input
        name="appSubTitle"
        onChange={handleInputChange}
        value={appSubTitle}
        placeholder="Application subtitle"
        mb={3}
      />

      <Label mb={2}>Language in the template</Label>
      <Select
        mb={3}
        name="lang"
        placeholder="Default language"
        onChange={handleInputChange}
        value={lang}
        disabled={!Object.keys(languages).length}
      >
        {Object.keys(languages).map((language, index) => {
          return (
            <option key={index} value={language}>
              {languages[language]}
            </option>
          );
        })}
      </Select>

      <Label mb={2}>Reminder time span</Label>
      <Input
        placeholder="Reminder time span (day)"
        value={notificationTimeSpan}
        onChange={handleInputChange}
        mb={3}
        name="notificationTimeSpan"
      />

      <Label mb={2}>Reminder duration (How many times should it be sent)</Label>
      <Input
        mb={3}
        name="reminderDuration"
        value={reminderDuration}
        onChange={handleInputChange}
        placeholder="How many times should we send reminders?"
      />

      <Label mb={2}>Confirmation email message</Label>
      <Textarea
        placeholder="Confirmation email message"
        name="emailConfirmationMessage"
        value={emailConfirmationMessage}
        onChange={handleInputChange}
        mb={3}
        minH={350}
        fontSize={25}
      />

      <Label mb={2}>Reset password email message</Label>
      <Textarea
        placeholder="Reset password email message"
        name="resetPasswordMessage"
        value={resetPasswordMessage}
        onChange={handleInputChange}
        mb={3}
        minH={350}
        fontSize={25}
      />

      <Label mb={2}>Affiliate Link email message</Label>
      <Textarea
        placeholder="Affiliate Link email message"
        name="affiliateLinkMessage"
        value={affiliateLinkMessage}
        onChange={handleInputChange}
        mb={3}
        minH={350}
        fontSize={25}
      />

      <Label mb={2}>Request message</Label>
      <Textarea
        placeholder="Request message"
        name="requestMessage"
        value={requestMessage}
        onChange={handleInputChange}
        mb={3}
        minH={350}
        fontSize={25}
      />

      <Label mb={2}>Reminder message</Label>
      <Textarea
        placeholder="Reminder message"
        name="reminderMessage"
        value={reminderMessage}
        onChange={handleInputChange}
        mb={3}
        minH={350}
        fontSize={25}
      />

      <Button disabled={processing} onClick={handleClick} colorScheme="secondary" color="black">
        {processing ? "Processing..." : "Save changes"}
      </Button>
    </Flex>
  );
}
