import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { Flex, Heading, HStack } from "@chakra-ui/layout";
import { Spinner } from "@chakra-ui/spinner";
import { Button } from "@chakra-ui/button";
import { Progress } from "@chakra-ui/progress";
import { Link, useHistory } from "react-router-dom";
import { CircularProgress, CircularProgressLabel, Text } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";

import useToast from "../../../hooks/useToast";
import useSettings from "../../../hooks/useSettings";
import useLogout from "../../../hooks/useLogout";

import config from "../../../config";

// components
import QuizArea from "./QuizArea";

// actions
import {
  LOAD_QUIZ,
  NEXT_QUESTION,
  RESET_QUIZ,
  DONT_KNOW,
  END_QUIZ,
} from "../../../redux/actions/quizActions";
import { CHANGE_SUB_TITLE } from "../../../redux/actions/settingsActions";
import { useRef } from "react";

const Quiz = ({ path }) => {
  const [hasAllPrerequisites, setHasAllPrerequisites] = useState(true);

  const toast = useToast(3000);
  const updateSettings = useSettings();
  const { courseId } = useParams();
  const { t } = useTranslation();
  const history = useHistory();
  const logout = useLogout();

  const {
    loading,
    questions,
    currentIndex,
    totalPercentage,
    done,
    score,
    questionsDontKnow,
    questionsWrong,
    knownQuestions,
    course,
  } = useSelector((state) => state.quizReducer);
  const dispatch = useDispatch();

  const [timer, setTimer] = useState(0);
  const [negativeAudio, setNegativeAudio] = useState();
  const [userCommitted, setUserCommitted] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [timerInterval, setTimerInterval] = useState();
  const currentTimeoutRef = useRef();

  // for fetching all the Quiz details
  async function fetchQuiz() {
    try {
      const res = await fetch(`${config.serverURL}/get_quiz/${path}/${courseId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const body = await res.json();

      if (res.ok) {
        if (!body.hasAllPrerequisites) {
          setHasAllPrerequisites(false);
        }
        // payment after checking phase
        else if (
          path === "getUserQuestionsOfCourse" &&
          !body.userHasPaid &&
          body.userHasToPay &&
          body.courseQuestions.length &&
          body.unknownQuestions.length >= (body.course.unknownQuestionLimitForPurchase || 0)
        ) {
          history.push(`/dashboard/pay/${courseId}`, {
            fromCheckingPhase: true,
          });
        } /* else if (body.userHasPaid && body.unknownQuestions.length >= (body.course.cpLimit || 0)) {
          history.push(`/dashboard/continue/${courseId}`);
        } */
        document.title = `${config.appName} - ${
          path === "getUserUnknownQuestions" ? "Activation Phase" : "Checking Phase"
        }: ${body.course.name}`;

        dispatch(CHANGE_SUB_TITLE(body.course.description));
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
            toast({ status: "error", description: t("quiz_dont_know"), duration: 1000 });
          }
        } else {
          toast({ status: "error", description: body.msg });
        }
      } catch (err) {
        toast({ status: "error", description: err.message });
      }
    }
  }

  // calling it when the quiz is ending up if the phase is Activation, then we send the known questions for repetition
  async function endQuizAction() {
    try {
      if (path === "getUserUnknownQuestions") {
        await fetch(`${config.serverURL}/get_quiz/spaced-repetition`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questions: knownQuestions }),
          credentials: "include",
        });
      }
    } catch (err) {
      toast({ status: "error", description: err.message });
    }
  }

  async function fetchAudioAssets() {
    try {
      const res = await fetch(`${config.serverURL}/get_quiz/get_assets`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
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
    dispatch(RESET_QUIZ());
    fetchQuiz();
    fetchAudioAssets();

    document.title = "Loading ...";

    return () => {
      // reset the quiz
      dispatch(RESET_QUIZ());
      currentTimeoutRef.current && clearTimeout(currentTimeoutRef.current);
      updateSettings();
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
      } else if (questions.length > 0 && questions[currentIndex].type === "text" && quizStarted) {
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
  }, [currentIndex, path, loading, userCommitted, quizStarted]);

  useEffect(() => {
    // timeout, if the user was unable to answer in the specified time
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
      toast({ status: "warning", description: t("quiz_time_up") });
      userDoesNotKnowTheAnswer(questions[currentIndex]._id, false, true);
    }
  }, [timer, currentIndex, path]);

  // when the user is done with the quiz
  useEffect(async () => {
    if (done) {
      const res = await fetch(`${config.serverURL}/get_quiz/getUserUnknownQuestions/${courseId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const body = await res.json();

      // if the user has got some unknown questions then ask him for payment to purchase them
      // it will be asked at the end of the quiz after 10 seconds
      if (
        path === "getUserQuestionsOfCourse" &&
        body.unknownQuestionsPack.length &&
        body.unknownQuestionsPack.length >= (body.course.unknownQuestionLimitForPurchase || 0)
      ) {
        const timeout = setTimeout(() => {
          history.push(`/dashboard/buyPackage/${courseId}`, {
            showOptions: !!body.course.unknownQuestionLimitForPurchase,
          });
        }, 10000);
        currentTimeoutRef.current = timeout;
      } else if (path === "getUserUnknownQuestions") {
        endQuizAction();
      }
    }
  }, [done]);

  useEffect(async () => {
    if (path !== "getUserQuestionsOfCourse") {
      return;
    }

    const res = await fetch(`${config.serverURL}/get_quiz/check/${courseId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    const body = await res.json();

    // check if the user has reached that amount of questions in his unknown words database
    if (
      path === "getUserQuestionsOfCourse" &&
      body.course.unknownQuestionLimitForPurchase &&
      questionsDontKnow + questionsWrong >= (body.course.unknownQuestionLimitForPurchase || 0)
    ) {
      let timeout = setTimeout(() => {
        dispatch(END_QUIZ());
      }, 1500);

      timeout = setTimeout(() => {
        if (!body.userHasPaid && body.userHasToPay) {
          history.push(`/dashboard/buyPackage/${courseId}`, {
            fromCheckingPhase: true,
            showOptions: true,
          });
          window.location.reload();
        } else {
          history.push("/dashboard/paymentSuccess", { showOptions: true, course });
          window.location.reload();
        }
      }, 10000);

      currentTimeoutRef.current = timeout;
    } else if (
      path === "getUserQuestionsOfCourse" &&
      body.course.cpLimit &&
      questionsDontKnow + questionsWrong >= (body.course.cpLimit || 0)
    ) {
      let timeout = setTimeout(() => {
        dispatch(END_QUIZ());
      }, 3000);

      timeout = setTimeout(() => {
        history.push(`/dashboard/continue/${courseId}`);
      }, 10 ** 4);

      currentTimeoutRef.current = timeout;
    }
  }, [questionsDontKnow, questionsWrong]);

  useEffect(() => {
    return async () => {
      const res = await fetch(`${config.serverURL}/get_quiz/reminder/${courseId}`, {
        method: "POST",
        credentials: "include",
      });
      const body = await res.json();
      if (!res.ok && res.status !== 401) {
        toast({ status: "warning", description: body.msg });
      }
    };
  }, [path]);

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
          ????
        </Heading>
        <Heading fontSize="2xl" color="GrayText" fontWeight="normal" mb={5}>
          {t("dont_have_all_prerequisites")}
        </Heading>
        <Button onClick={() => history.goBack()} colorScheme="secondary" color="black">
          {t("go_back")}
        </Button>
      </Flex>
    );
  }

  // if the user don't have any questions
  if (questions.length === 0 || !course._id) {
    return (
      <Flex w="full" h="full" justify="center" align="center" direction="column">
        <Heading mb={5} fontSize="9xl">
          ????
        </Heading>
        <Heading fontSize="2xl" mb={2} color="gray.500" fontWeight="normal" textAlign="center">
          {path === "getUserUnknownQuestions"
            ? t("no_unknown_questions")
            : t("no_words_to_learn_message")}
        </Heading>
        <Heading fontSize="1xl" fontWeight="normal" mb={3}>
          {path === "getUserUnknownQuestions"
            ? t("back_to_checking")
            : t("no_words_to_learn_sub_message")}
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
          {path === "getUserUnknownQuestions" ? t("checking_phase") : t("watch_concert")}
        </Button>
      </Flex>
    );
  }

  // when the quiz is done, show up the results
  if (done) {
    return (
      <Flex align="center" py={10} direction="column">
        <Heading textAlign="center" fontWeight="normal" mb={10}>
          {t("quiz_results")}
        </Heading>
        <CircularProgress color="primary" size="250px" value={totalPercentage}>
          <CircularProgressLabel color="primary" fontSize="25px">
            {t("known")}: {totalPercentage}%
          </CircularProgressLabel>
        </CircularProgress>
        <Flex direction="column" my={5}>
          <Text>
            {t("questions_known")}:{" "}
            <Text display="inline-block" color="blue.400">
              {score}
            </Text>
          </Text>
          <Text>
            {t("questions_not_known")}:{" "}
            <Text display="inline-block" color="blue.400">
              {questionsDontKnow}
            </Text>
          </Text>
          <Text>
            {t("wrong_answers")}:{" "}
            <Text display="inline-block" color="blue.400">
              {questionsWrong}
            </Text>
          </Text>
        </Flex>
        <HStack display={"flex"} justify="center" align={"center"} spacing={5}>
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
            {path === "getUserUnknownQuestions" ? t("back_to_checking") : t("watch_concert")}
          </Button>
          {path === "getUserUnknownQuestions" && (
            <Button onClick={logout} colorScheme={"blue"}>
              {t("logout")}
            </Button>
          )}
        </HStack>
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
        {course.quizIns && (
          <Text mt={5} color="GrayText" whiteSpace="pre-wrap">
            {course.quizIns}
          </Text>
        )}

        <Progress
          colorScheme="secondary"
          mt={5}
          w="full"
          rounded={5}
          value={timer}
          max={questions[currentIndex].timeLimit}
        />
      </Flex>

      {/* quiz status */}
      <Flex wrap="wrap" gridGap={5} justify="space-between" align="center" w="100%" maxW="800px">
        <Heading color="blue.500" fontSize="md" fontWeight="normal">
          {t("not_known")}: {questionsDontKnow}
        </Heading>
        <Heading color="blue.600" fontSize="md" fontWeight="normal">
          {t("wrong_answers")}: {questionsWrong}
        </Heading>
        <Heading color="blue.600" fontSize="md" fontWeight="normal">
          {t("score")}: {score}
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
          quizStarted={quizStarted}
        />
      </Flex>

      {/* the footer containing the buttons and question count */}
      <Flex wrap="wrap" direction={"column"} w="full" align={"center"} justify="center" mt={5}>
        <Heading fontSize="2xl" mb={5} color="blue.500" fontWeight="normal">
          {currentIndex + 1} of {questions.length} {t("questions")}
        </Heading>
        {questions[currentIndex].type === "text" && !quizStarted && (
          <Button
            minW={200}
            onClick={() => {
              setQuizStarted(true);
            }}
            colorScheme={"secondary"}
            color="black"
          >
            {t("start")}
          </Button>
        )}

        {((questions[currentIndex].type === "text" && quizStarted) ||
          questions[currentIndex].type === "mcq") &&
          !done &&
          path === "getUserQuestionsOfCourse" && (
            <Button
              onClick={() => {
                dispatch(END_QUIZ());
              }}
              minW={200}
              colorScheme="secondary"
              color={"black"}
            >
              {t("stop_checking_message")}
            </Button>
          )}
      </Flex>
    </Flex>
  );
};

export default Quiz;
