import { useEffect, useState } from "react";
import { Flex, Heading } from "@chakra-ui/layout";
import { Button } from "@chakra-ui/button";
import { Link } from "react-router-dom";
import useToast from "../../hooks/useToast";
import config from "../../config";
import { useParams } from "react-router-dom";
import { Spinner } from "@chakra-ui/spinner";
import { useDispatch, useSelector } from "react-redux";

import { LOAD_QUESTIONS, LOAD_ASSETS, RESET_CONCERT } from "../../redux/actions/concertActions";

import ActiveLearning from "../Dashboard/Concerts/ActiveLearning";
import PassiveLearning from "../Dashboard/Concerts/PassiveLearning";

export default function Alc() {
  const { questions, loading, currentIndex, currentPhase, ended } = useSelector(
    (state) => state.concertReducer
  );
  const [hasAllPrerequisites, setHasAllPrerequisites] = useState(true);

  const { courseId, alcId } = useParams();
  const toast = useToast();
  const dispatch = useDispatch();

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
        dispatch(LOAD_ASSETS(body.item || {}));
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
        body.courseQuestions = body.courseQuestions.map((question) => ({ ...question, question: question.question.replaceAll("_", "") }))
        dispatch(LOAD_QUESTIONS(body.courseQuestions));
        setHasAllPrerequisites(body.hasAllPrerequisites);
      } else {
        toast({ status: "error", description: body.msg });
      }
    } catch (err) {
      toast({ status: "error", description: err.message });
    }
  }

  useEffect(() => {
    dispatch(RESET_CONCERT());
    const abortController = new AbortController();
    fetchItem(abortController);
    fetchQuestions(abortController);
    return () => abortController.abort();
  }, []);

  useEffect(() => {
    return () => {
      dispatch(RESET_CONCERT());
    };
  }, [alcId, courseId]);

  if (loading) {
    return (
      <Flex w="full" h="full" justify="center" align="center">
        <Spinner />
      </Flex>
    );
  } else if (!hasAllPrerequisites) {
    return (
      <Flex justify="center" align="center">
        <Heading color="GrayText" fontSize="2xl" fontWeight="normal">
          You don't have all requirements to access this course
        </Heading>
      </Flex>
    );
  } else if (questions && !questions[currentIndex] && !questions.length) {
    return (
      <Flex justify="center" align="center" direction="column" mb={5} w="full" h="full">
        <Heading mb={5} color="GrayText" fontWeight="normal">
          No new words to learn
        </Heading>
        <Button
          colorScheme="secondary"
          color="black"
          as={Link}
          to={`/dashboard/activation_phase/${courseId}`}
        >
          Start Activation Phase
        </Button>
      </Flex>
    );
  } else if (ended) {
    return (
      <Flex w="full" h="full" justify="center" align="center" direction="column">
        <Heading fontSize="2xl" color="GrayText" fontWeight="normal" mb={5}>
          The concert has been ended
        </Heading>
        <Button
          colorScheme="secondary"
          color="black"
          as={Link}
          to={`/dashboard/activation_phase/${courseId}`}
        >
          Start Activation Phase
        </Button>
      </Flex>
    );
  } else {
    return (
      <Flex direction="column" w="full" h="full" rounded={5} overflow="hidden">
        {currentPhase === "active" ? <ActiveLearning /> : <PassiveLearning />}
      </Flex>
    );
  }
}
