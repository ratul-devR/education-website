import { useEffect, useState } from "react";
import { Flex, Heading } from "@chakra-ui/layout";
import useToast from "../../hooks/useToast";
import config from "../../config";
import { useParams } from "react-router-dom";
import { Spinner } from "@chakra-ui/spinner";

export default function Alc() {
  const [assets, setAssets] = useState();
  const [useDefaultAsset, setUseDefaultAsset] = useState(false)
  const [questions, setQuestions] = useState();
  const [loading, setLoading] = useState(true);
  const [hasAllPrerequisites, setHasAllPrerequisites] = useState(true);

  const {courseId, alcId} = useParams();
  const toast = useToast();

  async function fetchItem(abortController) {
    try {
      const res = await fetch(`${config.serverURL}/active_learning_concert/getItem/${alcId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        signal: abortController.signal,
        credentials: "include",
      });
      const body = await res.json();
      if (res.ok) {
        setAssets(body.item || {});
        setUseDefaultAsset(body.default ? true : false)
      } else {
        toast({ status: "error", description: body.msg });
      }
    } catch (err) {
      toast({ status: "error", description: err.message });
    }
  }

  async function fetchQuestions(abortController) {
    try {
      const res = await fetch(`${config.serverURL}/get_quiz/getUserUnknownQuestions/${courseId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        signal: abortController.signal,
        credentials: "include",
      });
      const body = await res.json();
      if (res.ok) {
        setQuestions(body.courseQuestions);
        setHasAllPrerequisites(body.hasAllPrerequisites);
      } else {
        toast({ status: "error", description: body.msg });
      }
    } catch (err) {
      toast({ status: "error", description: err.message });
    }
  }

  useEffect(() => {
    const abortController = new AbortController();
    fetchItem(abortController);
    fetchQuestions(abortController);
    return () => abortController.abort();
  }, []);

  useEffect(() => {
    if (assets && questions) {
      setLoading(false);
    }
  }, [assets, questions]);

  if (loading) {
    <Flex w="full" h="full" justify="center" align="center">
      <Spinner />
    </Flex>;
  } else if (!hasAllPrerequisites) {
    return (
      <Flex justify="center" align="center">
        <Heading color="GrayText" fontSize="2xl" fontWeight="normal">
          You don't have all requirements to access this course
        </Heading>
      </Flex>
    );
  }

  return (
    <Flex direction="column">
      <Heading>Alc!</Heading>
    </Flex>
  );
}
