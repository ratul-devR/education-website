import { useEffect, useState } from "react";
import { Flex, Heading } from "@chakra-ui/layout";
import useToast from "../../hooks/useToast";
import config from "../../config";
import { useParams } from "react-router-dom";
import { Spinner } from "@chakra-ui/spinner";
import { useDispatch, useSelector } from "react-redux";

import { LOAD_QUESTIONS, LOAD_ASSETS, RESET_CONCERT } from "../../redux/actions/concertActions";

import ActiveLearning from "../Dashboard/Concerts/ActiveLearning";

export default function Alc() {
  const { questions, loading, currentIndex, currentPhase } = useSelector(
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
    dispatch(RESET_CONCERT())
    const abortController = new AbortController();
    fetchItem(abortController);
    fetchQuestions(abortController);
    return () => 
       abortController.abort();
  }, []);

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
      <Flex justify="center" align="center" w="full" h="full">
        <Heading>No new words to learn</Heading>
      </Flex>
    );
  } else {
    return (
      <Flex direction="column" w="full" h="full" rounded={5} overflow="hidden">
        {currentPhase === "active" ? (
          <ActiveLearning />
        ) : (
          <Flex direction="column">
            <h1>Passive learning</h1>
          </Flex>
        )}
      </Flex>
    );
  }
}
