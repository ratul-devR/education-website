import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { Flex, Heading } from "@chakra-ui/layout";
import { Spinner } from "@chakra-ui/spinner";
import { Button } from "@chakra-ui/button";
import { Progress } from "@chakra-ui/progress";
import { Link } from "react-router-dom";

import useToast from "../../../hooks/useToast";

import config from "../../../config";

// components
import QuizArea from "./QuizArea";

// actions
import {
  LOAD_QUIZ,
  NEXT_QUESTION,
  RESET_QUIZ,
  QUIZ_DONE,
} from "../../../redux/actions/quizActions";

const Quiz = ({ path }) => {
  const toast = useToast();
  const { courseId } = useParams();

  const {
    loading,
    questions,
    currentIndex,
    course,
    done,
    timeLimit,
    score,
    questionsDontKnow,
    questionsWrong,
  } = useSelector((state) => state.quizReducer);
  const dispatch = useDispatch();

  const [timer, setTimer] = useState(0);

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
        document.title = `${config.appName} - Quiz: ${body.course.name}`;
        dispatch(
          LOAD_QUIZ({
            questions: body.courseQuestions,
            course: body.course,
            timeLimit: body.course.timeLimit,
          })
        );
      } else {
        toast({ status: "error", description: body.msg });
      }
    } catch (err) {
      toast({ status: "error", description: err.message || "Error!" });
    }
  }

  // for switching to the next question
  function nextQuestion() {
    dispatch(NEXT_QUESTION());
  }

  useEffect(() => {
    const abortController = new AbortController();
    fetchQuiz(abortController);
    document.title = "Loading ...";

    return () => {
      // reset the question
      dispatch(RESET_QUIZ());
      abortController.abort();
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((pre) => pre + 1);
    }, 1000);
    return () => {
      clearInterval(interval);
      setTimer(0);
    };
  }, [currentIndex, timeLimit]);

  useEffect(() => {
    if (timer !== 0 && timeLimit !== 0 && timer === timeLimit && !done && questions.length > 0) {
      setTimer(0);
      dispatch(NEXT_QUESTION());
      toast({ status: "warning", description: "Time up" });
    }
  }, [timer, timeLimit]);

  if (loading) {
    return (
      <Flex w="full" h="full" justify="center" align="center">
        <Spinner />
      </Flex>
    );
  }

  // if the user don't have any questions
  if (questions.length === 0) {
    return (
      <Flex w="full" h="full" justify="center" align="center" direction="column">
        <Heading mb={5} fontSize="9xl">
          🙂
        </Heading>
        <Heading fontSize="2xl" mb={2} color="gray.500" fontWeight="normal" textAlign="center">
          {path === "getUserUnknownQuestions"
            ? "You don't have any unknown questions"
            : "You don'y have any questions remaining"}
        </Heading>
        <Heading fontSize="1xl" fontWeight="normal" mb={3}>
          {path === "getUserUnknownQuestions"
            ? "Would you like to play quiz?"
            : "Why you aren't getting some?"}
        </Heading>
        <Button
          colorScheme="secondary"
          color="black"
          as={Link}
          to={
            path === "getUserUnknownQuestions" ? `/dashboard/quiz` : `/dashboard/pay/${course._id}`
          }
        >
          {path === "getUserUnknownQuestions" ? "Play Quiz" : "Get Questions"}
        </Button>
      </Flex>
    );
  }

  // when the quiz is done, show up the results
  if (done) {
    return (
      <Flex w="full" h="full" align="center" py={10} direction="column">
        <Heading textAlign="center" fontWeight="normal" mb={10}>
          Quiz results
        </Heading>
        <Heading color="primary" fontWeight="normal" mb={10}>
          {score}/{questions.length}
        </Heading>
        <Button
          as={Link}
          to={
            path === "getUserUnknownQuestions" ? "/dashboard/activation_phrase" : "/dashboard/quiz"
          }
          colorScheme="secondary"
          color="black"
        >
          {path === "getUserUnknownQuestions"
            ? "Back To Activation Phrase"
            : "Go back to learnings"}
        </Button>
        {score === questions.length ? (
          <Heading mt={10} color="green">
            Excellent!!
          </Heading>
        ) : (
          <Heading mt={10} color="blue.500">
            Nice work!
          </Heading>
        )}
      </Flex>
    );
  }

  return (
    <Flex w="full" h="full" direction="column" align="center" gridRowGap={5} py={10}>
      {/* quiz header */}
      <Flex direction="column" justify="center" w="full" align="center">
        <Heading
          fontSize="3xl"
          fontWeight="normal"
          textAlign="center"
          whiteSpace="wrap"
          color="primary"
        >
          {course.name}
        </Heading>

        <Progress
          colorScheme="secondary"
          mt={5}
          w="100%"
          maxW="300px"
          rounded={5}
          value={timer}
          max={timeLimit}
        />
      </Flex>

      {/* quiz status */}
      <Flex wrap="wrap" gridGap={5} justify="space-between" align="center" w="100%" maxW="450px">
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
        maxW="450px"
        p={10}
        rounded={5}
        boxShadow="md"
      >
        <QuizArea path={path} />
      </Flex>

      {/* the footer containing the buttons and question count */}
      <Flex wrap="wrap" w="full" gridGap={5} justify="space-between" direction="row-reverse">
        <Flex gridColumnGap={2}>
          <Button onClick={nextQuestion} colorScheme="blue">
            Next
          </Button>
          <Button onClick={() => dispatch(QUIZ_DONE())} colorScheme="secondary" color="black">
            Get Result
          </Button>
        </Flex>

        <Heading fontSize="1xl" fontWeight="normal" color="blue.500">
          {currentIndex + 1} of {questions.length} Questions
        </Heading>
      </Flex>
    </Flex>
  );
};

export default Quiz;
