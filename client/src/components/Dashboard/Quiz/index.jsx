import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { Flex, Heading } from "@chakra-ui/layout";
import { Spinner } from "@chakra-ui/spinner";
import { Button } from "@chakra-ui/button";
import { Progress } from "@chakra-ui/progress";
import { Link, useHistory } from "react-router-dom";
import { CircularProgress, CircularProgressLabel, Text } from "@chakra-ui/react";

import useToast from "../../../hooks/useToast";

import config from "../../../config";

// components
import QuizArea from "./QuizArea";

// actions
import {
  LOAD_QUIZ,
  NEXT_QUESTION,
  RESET_QUIZ,
  DONT_KNOW,
} from "../../../redux/actions/quizActions";

const Quiz = ({ path }) => {
  const [hasAllPrerequisites, setHasAllPrerequisites] = useState(true);

  const toast = useToast();
  const { courseId } = useParams();
  const history = useHistory();

  const {
    loading,
    questions,
    currentIndex,
    course,
    totalPercentage,
    done,
    score,
    questionsDontKnow,
    questionsWrong,
  } = useSelector((state) => state.quizReducer);
  const dispatch = useDispatch();

  const [timer, setTimer] = useState(0);
  const [negativeAudio, setNegativeAudio] = useState();
  const [userCommitted, setUserCommitted] = useState(false);
  const [timerInterval, setTimerInterval] = useState();

  // for fetching all the Quiz details
  async function fetchQuiz(abortController) {
    try {
      const res = await fetch(`${config.serverURL}/get_quiz/${path}/${courseId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        signal: abortController.signal,
      });
      const body = await res.json();

      if (res.ok) {
        if (!body.hasAllPrerequisites) {
          setHasAllPrerequisites(false);
        } else if (path === "getUserQuestionsOfCourse" && !body.userHasPaid && body.userHasToPay) {
          history.push(`/dashboard/pay/${courseId}`, { fromCheckingPhase: true });
        }

        document.title = `${config.appName} - ${
          path === "getUserUnknownQuestions" ? "Activation Phase" : "Checking Phase"
        }: ${body.course.name}`;

        dispatch(
          LOAD_QUIZ({
            // shuffle the question options
            questions: body.courseQuestions.map((question) => {
              question.options.sort(() => Math.random() - 0.5);
              return question;
            }),
            course: body.course,
          })
        );
      } else {
        toast({ status: "error", description: body.msg });
      }
    } catch (err) {
      toast({ status: "error", description: err.message || "Error!" });
    }
  }

  // if the user doesn't knows the answer then show him the next Q
  // and show up a toast
  // this function will be called when the user click on I don't know and also when the user gives the wrong answer also if the the times up and the user is not able to give the correct answer
  async function userDoesNotKnowTheAnswer(questionId, answered, timeOut) {
    // if the question was not answered in specified time
    if (!answered && !timeOut) {
      dispatch(DONT_KNOW());
      dispatch(NEXT_QUESTION());
    }
    // stop the timer
    clearInterval(timerInterval);
    // if this is not activation phase, only then call it
    // cause if the user doesn't knows the answer, it will be moved to the activation phase
    // but in activation phase, if the user doesn't knows the answer,
    // it remains as it is.
    if (path !== "getUserUnknownQuestions") {
      try {
        const res = await fetch(`${config.serverURL}/get_quiz/dontKnow`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            questionId,
            type: path === "getUserUnknownQuestions" ? "activation_phase" : "checking_phase",
          }),
        });
        const body = await res.json();
        if (res.ok) {
          if (!answered && !timeOut) {
            toast({ status: "error", description: "You don't know the answer", duration: 1000 });
          }
        } else {
          toast({ status: "error", description: body.msg });
        }
      } catch (err) {
        toast({ status: "error", description: err.message });
      }
    }
  }

  async function fetchAudioAssets(abortController) {
    try {
      const res = await fetch(`${config.serverURL}/get_quiz/get_assets`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        signal: abortController.signal,
      });
      const body = await res.json();
      if (res.ok && body.asset) {
        setNegativeAudio(new Audio(body.asset.negative_sound.url));
      }
    } catch (err) {
      toast({ status: "error", description: err.message });
    }
  }

  useEffect(() => {
    const abortController = new AbortController();

    fetchQuiz(abortController);
    fetchAudioAssets(abortController);

    document.title = "Loading ...";

    return () => {
      // reset the quiz
      dispatch(RESET_QUIZ());
      abortController.abort();
    };
  }, [path]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (
        !loading &&
        userCommitted &&
        questions[currentIndex].type === "mcq" &&
        questions.length > 0
      ) {
        setTimer((pre) => pre + 1);
      } else if (questions.length > 0 && questions[currentIndex].type === "text") {
        setTimer((pre) => pre + 1);
      }
    }, 1000);
    // in the quiz area component, I am clearing this timer when the user selects an option or submit his answer
    setTimerInterval(interval);
    return () => {
      clearInterval(interval);
      setTimer(0);
      setTimerInterval(null);
    };
  }, [currentIndex, currentIndex, path, loading, userCommitted]);

  useEffect(() => {
    if (
      timer &&
      questions[currentIndex] &&
      timer !== 0 &&
      questions[currentIndex].timeLimit !== 0 &&
      timer > questions[currentIndex].timeLimit &&
      !done &&
      questions.length > 0 &&
      hasAllPrerequisites
    ) {
      setTimer(0);
      dispatch(NEXT_QUESTION());
      dispatch(DONT_KNOW());
      negativeAudio && negativeAudio.play();
      toast({ status: "warning", description: "Time up" });
      userDoesNotKnowTheAnswer(questions[currentIndex]._id, false, true);
    }
  }, [timer, currentIndex, path]);

  if (loading) {
    return (
      <Flex w="full" h="full" justify="center" align="center">
        <Spinner />
      </Flex>
    );
  }

  // if the user doesn't have all the prerequisites to access this course,
  if (!hasAllPrerequisites && !loading) {
    return (
      <Flex w="full" h="full" justify="center" align="center" direction="column">
        <Heading fontSize="9xl" mb={5}>
          😶
        </Heading>
        <Heading fontSize="2xl" color="GrayText" fontWeight="normal" mb={5}>
          You Don't have all the prerequisites to access this course.
        </Heading>
        <Button onClick={() => history.goBack()} colorScheme="secondary" color="black">
          Go Back
        </Button>
      </Flex>
    );
  }

  // if the user don't have any questions
  if (questions.length === 0 || !course._id) {
    return (
      <Flex w="full" h="full" justify="center" align="center" direction="column">
        <Heading mb={5} fontSize="9xl">
          🙂
        </Heading>
        <Heading fontSize="2xl" mb={2} color="gray.500" fontWeight="normal" textAlign="center">
          {path === "getUserUnknownQuestions"
            ? "You don't have any unknown questions"
            : "You don't have any new words to learn"}
        </Heading>
        <Heading fontSize="1xl" fontWeight="normal" mb={3}>
          {path === "getUserUnknownQuestions"
            ? "Would you like to go back to checking phase?"
            : "Would you like to watch concerts?"}
        </Heading>
        <Button
          colorScheme="secondary"
          color="black"
          as={Link}
          to={
            path === "getUserUnknownQuestions"
              ? `/dashboard/quiz/${course._id}`
              : `/dashboard/alcs/${course._id}`
          }
        >
          {path === "getUserUnknownQuestions" ? "Play Quiz" : "Watch Concert"}
        </Button>
      </Flex>
    );
  }

  // when the quiz is done, show up the results
  if (done) {
    return (
      <Flex align="center" py={10} direction="column">
        <Heading textAlign="center" fontWeight="normal" mb={10}>
          Quiz results
        </Heading>
        <CircularProgress color="primary" size="200px" value={totalPercentage}>
          <CircularProgressLabel color="primary" fontSize="25px">
            Known: {totalPercentage}%
          </CircularProgressLabel>
        </CircularProgress>
        <Flex direction="column" my={5}>
          <Text>
            Questions known:{" "}
            <Text display="inline-block" color="blue.400">
              {score}
            </Text>
          </Text>
          <Text>
            Questions Unknown:{" "}
            <Text display="inline-block" color="blue.400">
              {questionsDontKnow}
            </Text>
          </Text>
          <Text>
            Questions wrong:{" "}
            <Text display="inline-block" color="blue.400">
              {questionsWrong}
            </Text>
          </Text>
        </Flex>
        <Button
          as={Link}
          to={
            path === "getUserUnknownQuestions"
              ? `/dashboard/quiz/${course._id}`
              : `/dashboard/alcs/${course._id}`
          }
          colorScheme="secondary"
          color="black"
        >
          {path === "getUserUnknownQuestions" ? "Back to Checking Phase" : "Start Concerts"}
        </Button>
      </Flex>
    );
  }

  return (
    <Flex direction="column" align="center" gridRowGap={5} py={10}>
      {/* quiz header */}
      <Flex direction="column" maxW="800px" justify="center" w="full" align="center">
        <Heading
          fontSize="3xl"
          fontWeight="normal"
          textAlign="center"
          whiteSpace="wrap"
          color="primary"
        >
          {course.name}
        </Heading>
        {course.quizIns && <Text mt={5} color="GrayText" whiteSpace="pre-wrap">{course.quizIns}</Text>}

        <Progress
          colorScheme="secondary"
          mt={5}
          w="100%"
          rounded={5}
          value={timer}
          max={questions[currentIndex].timeLimit}
        />
      </Flex>

      {/* quiz status */}
      <Flex wrap="wrap" gridGap={5} justify="space-between" align="center" w="100%" maxW="800px">
        <Heading color="blue.500" fontSize="md" fontWeight="normal">
          Not known: {questionsDontKnow}
        </Heading>
        <Heading color="blue.600" fontSize="md" fontWeight="normal">
          Wrong answers: {questionsWrong}
        </Heading>
        <Heading color="blue.600" fontSize="md" fontWeight="normal">
          Score: {score}
        </Heading>
      </Flex>

      {/* quiz area */}
      <Flex
        w="100%"
        border="1px solid"
        borderColor="gray.100"
        maxW="800px"
        p={10}
        rounded={5}
        boxShadow="md"
      >
        <QuizArea
          userDoesNotKnowTheAnswer={userDoesNotKnowTheAnswer}
          timerInterval={timerInterval}
          path={path}
          setUserCommitted={setUserCommitted}
        />
      </Flex>

      {/* the footer containing the buttons and question count */}
      <Flex wrap="wrap" w="full" justify="center" mt={5}>
        <Heading fontSize="2xl" color="blue.500" fontWeight="normal">
          {currentIndex + 1} of {questions.length} Questions
        </Heading>
      </Flex>
    </Flex>
  );
};

export default Quiz;
