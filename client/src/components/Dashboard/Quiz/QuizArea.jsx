import "./style.css";
import { Button } from "@chakra-ui/button";
import { Flex, Heading } from "@chakra-ui/layout";
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

const QuizArea = ({ path }) => {
  const [userKnowsAnswer, setUserKnowsAnswer] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState();
  const [className, setClassName] = useState("option");
  const [input, setInput] = useState("");

  const { currentIndex, questions } = useSelector((state) => state.quizReducer);
  const dispatch = useDispatch();
  const toast = useToast();

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

  // for handling option click
  function checkAnswer(usersAnswer, questionId) {
    let isCorrectAnswer;

    if (questions[currentIndex].type === "mcq") {
      isCorrectAnswer = questions[currentIndex].answer === usersAnswer;
      setSelectedAnswer(usersAnswer);
    } else {
      isCorrectAnswer = questions[currentIndex].answer.toLowerCase() === input.toLowerCase();
      setSelectedAnswer(usersAnswer);
    }

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
      if (questions[currentIndex].type === "text") {
        toast({ status: "success", description: "Correct Answer" });
      }
    } else {
      setClassName("option wrong");
      dispatch(WRONG_ANSWER());
      if (questions[currentIndex].type === "text") {
        toast({
          status: "warning",
          description: `The correct answer is: "${questions[currentIndex].answer}"`,
          title: "Wrong Answer",
        });
      }
    }
  }

  useEffect(() => {
    setUserKnowsAnswer(false);
    setClassName("option");
    setSelectedAnswer();
    setInput("");
    return () => null;
  }, [currentIndex]);

  return (
    <Flex w="full" h="full" direction="column">
      <Heading
        whiteSpace="pre-wrap"
        fontSize="1xl"
        py={3}
        fontWeight="normal"
        color="GrayText"
        mb={3}
      >
        {questions[currentIndex].question}
      </Heading>

      {!userKnowsAnswer ? (
        <Flex w="full" direction="column">
          <Heading fontSize="1xl" fontWeight="normal" mb={3} whiteSpace="wrap">
            Do you know the answer of this question?
          </Heading>
          <Flex w="full" justify="flex-start" align="center" gridColumnGap={2}>
            <Tooltip hasArrow label="Great! Now let's see if you can give the correct answer">
              <Button onClick={useKnowsTheAnswer} colorScheme="blue">
                I know :)
              </Button>
            </Tooltip>
            <Tooltip hasArrow label="That's fine. Let's try out the next one :)">
              <Button
                onClick={() => userDoesNotKnowTheAnswer(questions[currentIndex]._id)}
                colorScheme="red"
              >
                I Don't know :(
              </Button>
            </Tooltip>
          </Flex>
        </Flex>
      ) : (
        // if the user knows the answer, then shop up the options
        <Flex w="full" h="full" justify="center" direction="column" gridRowGap={2}>
          {questions[currentIndex].type === "mcq" ? (
            questions[currentIndex].options.map((option, index) => {
              return (
                <div
                  onClick={() =>
                    !selectedAnswer && checkAnswer(option, questions[currentIndex]._id)
                  }
                  key={index}
                  className={selectedAnswer === option ? className : "option"}
                  style={{
                    background:
                      option === questions[currentIndex].answer && selectedAnswer && "#38a169",
                    color: option === questions[currentIndex].answer && selectedAnswer && "#fff",
                    borderColor:
                      option === questions[currentIndex].answer && selectedAnswer && "#38a169",
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
        </Flex>
      )}
    </Flex>
  );
};

export default QuizArea;
