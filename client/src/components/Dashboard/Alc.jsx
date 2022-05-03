import { useEffect, useState } from "react";
import { Flex, Heading } from "@chakra-ui/layout";
import { Button } from "@chakra-ui/button";
import { Link } from "react-router-dom";
import useToast from "../../hooks/useToast";
import useSettings from "../../hooks/useSettings";
import config from "../../config";
import { useParams } from "react-router-dom";
import { Spinner } from "@chakra-ui/spinner";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { Text } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";

import {
  LOAD_QUESTIONS,
  LOAD_ASSETS,
  RESET_CONCERT,
  START_CONCERT,
  START_ACTIVE_LEARNING,
  START_PASSIVE_LEARNING,
} from "../../redux/actions/concertActions";
import { CHANGE_SUB_TITLE } from "../../redux/actions/settingsActions";

import ActiveLearning from "../Dashboard/Concerts/ActiveLearning";
import PassiveLearning from "../Dashboard/Concerts/PassiveLearning";

export default function Alc() {
  const {
    questions,
    loading,
    currentIndex,
    currentPhase,
    ended,
    concertStarted,
    course,
    activeLearningEnded,
    passiveLearningEnded,
  } = useSelector((state) => state.concertReducer);
  const [hasAllPrerequisites, setHasAllPrerequisites] = useState(true);

  const { courseId, alcId } = useParams();
  const toast = useToast();
  const getSettings = useSettings();
  const history = useHistory();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  // fetching the learning track
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
        // if the user has questions in his learning pack and if he doesn't have anything to learn
        // if the user has the number of questions that is determined by the admin in his not known DB,
        // then ask for payment
        if (body.unknownQuestionsPack.length > 0 && !body.learningQuestions.length) {
          history.push(`/dashboard/buyPackage/${courseId}`, { phase: "learning" });
        } else {
          dispatch(LOAD_QUESTIONS({ questions: body.learningQuestions, course: body.course }));
          setHasAllPrerequisites(body.hasAllPrerequisites);
          // change the sub title with the course description in the nav bar
          dispatch(CHANGE_SUB_TITLE(body.course.description));
        }
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
    return () => {
      abortController.abort();
      dispatch(RESET_CONCERT());
      getSettings();
    };
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
          {t("dont_have_all_prerequisites")}
        </Heading>
      </Flex>
    );
  } else if (questions && !questions[currentIndex] && !questions.length) {
    return (
      <Flex justify="center" align="center" direction="column" mb={5} w="full" h="full">
        <Heading mb={5} color="GrayText" fontWeight="normal">
          {t("no_words_to_learn_message")}
        </Heading>
        <Button
          colorScheme="secondary"
          color="black"
          as={Link}
          to={`/dashboard/activation_phase/${courseId}`}
        >
          {t("start_activation_phase")}
        </Button>
      </Flex>
    );
  } else if (!concertStarted && course.concertIns) {
    return (
      <Flex w="full" justify="center" align="center" direction="column">
        <Heading mb={5} color="primary" fontWeight="normal">
          {t("instruction")}
        </Heading>
        <Text color="GrayText" mb={5} fontSize={25} whiteSpace="pre-wrap">
          {course.concertIns}
        </Text>
        <Button onClick={() => dispatch(START_CONCERT())} colorScheme="secondary" color="black">
          {t("get_started")}
        </Button>
      </Flex>
    );
  } else if (activeLearningEnded) {
    return (
      <Flex w="full" h="full" justify="center" align="center" direction="column">
        <Heading fontSize="2xl" color="GrayText" fontWeight="normal" whiteSpace={"normal"} mb={5}>
          {t("active_learning_concert_has_been_ended")}
        </Heading>
        <Button
          onClick={() => dispatch(START_PASSIVE_LEARNING())}
          colorScheme="secondary"
          color="black"
        >
          {t("passive_learning_concert")}
        </Button>
      </Flex>
    );
  } else if (passiveLearningEnded) {
    return (
      <Flex w="full" h="full" justify="center" align="center" direction="column">
        <Heading whiteSpace={"pre-wrap"} fontSize="2xl" color="GrayText" fontWeight="normal" mb={5}>
          {t("passive_learning_concert_has_been_ended")}
        </Heading>
        <Button
          colorScheme="secondary"
          color="black"
          onClick={() => dispatch(START_ACTIVE_LEARNING())}
        >
          {t("active_learning_concert")}
        </Button>
      </Flex>
    );
  } else if (ended) {
    return (
      <Flex w="full" h="full" justify="center" align="center" direction="column">
        <Heading whiteSpace={"nowrap"} fontSize="2xl" color="GrayText" fontWeight="normal" mb={5}>
          {t("concert_has_been_ended")}
        </Heading>
        <Button
          colorScheme="secondary"
          color="black"
          as={Link}
          to={`/dashboard/activation_phase/${courseId}`}
        >
          {t("start_activation_phase")}
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
