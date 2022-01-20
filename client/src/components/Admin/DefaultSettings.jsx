import { useEffect, useState } from "react";
import { Flex, Heading } from "@chakra-ui/layout";
import { Text } from "@chakra-ui/react";
import { Input } from "@chakra-ui/input";
import { Button } from "@chakra-ui/button";
import useToast from "../../hooks/useToast";
import config from "../../config";
import { Spinner } from "@chakra-ui/spinner";
import { useDispatch } from "react-redux"
import { FETCH_AND_UPDATE_SETTINGS } from "../../redux/actions/settingsActions"

export default function DefaultSettings() {
  const [{ appSubTitle, _id }, setInput] = useState({ appSubTitle: "" });
  const [newSettings, editSettings] = ["newSettings", "editSettings"];
  const [processing, setProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [path, setPath] = useState(newSettings);
  const toast = useToast();
  const dispatch = useDispatch()

  async function fetchSettings(abortController) {
    try {
      const res = await fetch(`${config.serverURL}/get_settings`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        signal: abortController.signal,
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
          body: JSON.stringify({ appSubTitle }),
        }
      );
      const body = await res.json();
      if (res.ok) {
        dispatch(FETCH_AND_UPDATE_SETTINGS(body.settings))
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
    const abortController = new AbortController();
    fetchSettings(abortController);
    return () => abortController.abort();
  }, []);

  if (loading) {
    return (
      <Flex w="full" h="full" direction="column" justify="center" align="center">
        <Spinner />
      </Flex>
    );
  }

  return (
    <Flex w="full" h="full" direction="column">
      <Heading color="primary" mb={3} fontWeight="normal" fontSize="2xl">
        Default Settings
      </Heading>
      <Text color="GrayText" mb={10}>
        Some handy settings
      </Text>
      <Input
        name="appSubTitle"
        onChange={handleInputChange}
        value={appSubTitle}
        placeholder="Application subtitle"
        mb={3}
      />
      <Button
        disabled={!appSubTitle || processing}
        onClick={handleClick}
        colorScheme="secondary"
        color="black"
      >
        {processing ? "Processing..." : "Save changes"}
      </Button>
    </Flex>
  );
}
