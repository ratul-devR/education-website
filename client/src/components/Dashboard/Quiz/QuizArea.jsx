import "./style.css";
import { Button } from "@chakra-ui/button";
import { Flex, Heading, Grid } from "@chakra-ui/layout";
import { Input } from "@chakra-ui/input";
import { Tooltip } from "@chakra-ui/tooltip";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import config from "../../../config";
import useToast from "../../../hooks/useToast";

import {
  CHANGE_SCORE,
  DONT_KNOW,
  NEXT_QUESTION,
  WRONG_ANSWER,
} from "../../../redux/actions/quizActions";
import { LOGIN } from "../../../redux/actions/authActions";

const QuizArea = ({ path, timerInterval }) => {
  const [userKnowsAnswer, setUserKnowsAnswer] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState();
  const [className, setClassName] = useState("option");
  const [input, setInput] = useState("");

  // audios
  const [backgroundAudio, setBackgroundAudio] = useState();
  const [positiveAudio, setPositiveAudio] = useState();
  const [negativeAudio, setNegativeAudio] = useState();

  const { currentIndex, questions } = useSelector((state) => state.quizReducer);
  const dispatch = useDispatch();
  const toast = useToast();

  // fetch all the audio assets for the quiz
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
        setBackgroundAudio(new Audio(body.asset.background_sound.url));
        setPositiveAudio(new Audio(body.asset.positive_sound.url));
        setNegativeAudio(new Audio(body.asset.negative_sound.url));
      }
    } catch (err) {
      toast({ status: "error", description: err.message });
    }
  }

  // if the user doesn't knows the answer then show him the next Q
  // and show up a toast
  async function userDoesNotKnowTheAnswer(questionId) {
    dispatch(DONT_KNOW());
    dispatch(NEXT_QUESTION());
    if (path !== "getUserUnknownQuestions") {
      try {
        const res = await fetch(`${config.serverURL}/get_quiz/dontKnow`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ questionId }),
        });
        const body = await res.json();
        if (!res.ok) {
          toast({ status: "error", description: body.msg });
        }
      } catch (err) {
        toast({ status: "error", description: err.message });
      }
    }
  }

  // if the user knows the answer
  function useKnowsTheAnswer() {
    setUserKnowsAnswer(true);
  }

  // play the feedback sound according to the answer
  function playFeedBackAudio(correctAnswer) {
    if (positiveAudio && negativeAudio) {
      if (correctAnswer) {
        positiveAudio.currentTime = 0;
        positiveAudio.play();
      } else {
        negativeAudio.currentTime = 0;
        negativeAudio.play();
      }
    }
  }

  // for stopping all feedback sounds for a specific action
  function stopFeedBackSounds() {
    if (positiveAudio && negativeAudio) {
      positiveAudio.pause();
      negativeAudio.pause();
    }
  }

  // for stopping all the audios
  function stopAllAudios() {
    if (positiveAudio && negativeAudio && backgroundAudio) {
      backgroundAudio.pause();
      positiveAudio.pause();
      negativeAudio.pause();
    }
  }

  // for handling option click
  function checkAnswer(usersAnswer, questionId) {
    setSelectedAnswer(usersAnswer);

    // stop the timer
    clearInterval(timerInterval);

    let isCorrectAnswer;

    if (questions[currentIndex].type === "mcq") {
      isCorrectAnswer = questions[currentIndex].answers.includes(usersAnswer);
    } else {
      isCorrectAnswer = questions[currentIndex].answers.includes(input);
    }

    // play the sound according to the answer
    playFeedBackAudio(isCorrectAnswer);

    if (isCorrectAnswer) {
      const correctAnswerPath =
        path === "getUserUnknownQuestions" ? "apCorrectAnswer" : "correctAnswer";

      // updating the database
      fetch(`${config.serverURL}/get_quiz/${correctAnswerPath}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ questionId }),
      })
        .then((res) => res.json())
        .then((body) => {
          dispatch(LOGIN(body.user));
        })
        .catch((err) =>
          toast({
            status: "error",
            description: err.message || "We are having unexpected server side errors",
          })
        );
      setClassName("option correct");
      // changing the score
      dispatch(CHANGE_SCORE());
      toast({ status: "success", description: "Correct Answer" });
    } else {
      setClassName("option wrong");
      dispatch(WRONG_ANSWER());
      toast({
        status: "warning",
        description: `Wrong Answer`,
      });
    }
  }

  useEffect(() => {
    const abortController = new AbortController();
    fetchAudioAssets(abortController);
    return () => abortController.abort();
  }, []);

  // play the background sound when it is ready
  useEffect(() => {
    if (backgroundAudio) {
      backgroundAudio.currentTime = 0;
      backgroundAudio.volume = 0.3;
      backgroundAudio.play();
    }
    return () => {
      stopAllAudios();
    };
  }, [backgroundAudio, positiveAudio, negativeAudio]);

  useEffect(() => {
    setUserKnowsAnswer(false);
    setClassName("option");
    setSelectedAnswer();
    setInput("");
    return () => {
      stopFeedBackSounds();
    };
  }, [currentIndex]);

  return (
    <Flex w="full" h="full" direction="column">
      <Heading
        whiteSpace="pre-wrap"
        fontSize="4xl"
        textAlign="center"
        py={3}
        fontWeight="normal"
        mb={5}
      >
        {questions[currentIndex].question}
      </Heading>

      {!userKnowsAnswer ? (
        <Flex w="full" direction="column">
          <Flex w="full" justify="center" align="center" gridColumnGap={2}>
            <Tooltip hasArrow label="Show Options">
              <Button flex={1} onClick={useKnowsTheAnswer} colorScheme="blue">
                I know
              </Button>
            </Tooltip>
            <Tooltip hasArrow label="Try the next one">
              <Button
                flex={1}
                onClick={() => userDoesNotKnowTheAnswer(questions[currentIndex]._id)}
                colorScheme="red"
              >
                I Don't know
              </Button>
            </Tooltip>
          </Flex>
        </Flex>
      ) : (
        // if the user knows the answer, then show up the options
        <Grid
          templateColumns={
            questions[currentIndex].type === "text"
              ? "1fr"
              : { base: "1fr 1fr", sm: "1fr", md: "1fr 1fr", lg: "1fr 1fr" }
          }
          gridGap={2}
          // w="full"
          // h="full"
          // justify="center"
          // direction="column"
        >
          {questions[currentIndex].type === "mcq" ? (
            questions[currentIndex].options.map((option, index) => {
              return (
                <div
                  key={index}
                  onClick={() =>
                    !selectedAnswer && checkAnswer(option, questions[currentIndex]._id)
                  }
                  className={selectedAnswer === option ? className : "option"}
                  style={{
                    background:
                      questions[currentIndex].answers.includes(option) &&
                      selectedAnswer &&
                      "#38a169",
                    color:
                      questions[currentIndex].answers.includes(option) && selectedAnswer && "#fff",
                    borderColor:
                      questions[currentIndex].answers.includes(option) &&
                      selectedAnswer &&
                      "#38a169",
                  }}
                >
                  {option}
                </div>
              );
            })
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                !selectedAnswer && checkAnswer(input, questions[currentIndex]._id);
              }}
            >
              <Input
                placeholder="Enter the answer > hit enter"
                value={input}
                disabled={selectedAnswer}
                onChange={(e) => setInput(e.target.value)}
              />
            </form>
          )}
        </Grid>
      )}
    </Flex>
  );
};

export default QuizArea;
