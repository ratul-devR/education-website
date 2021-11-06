import { Button } from "@chakra-ui/button";
import { Box, Flex, Heading } from "@chakra-ui/layout";
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

const QuizArea = () => {
  const [userKnowsAnswer, setUserKnowsAnswer] = useState(false);

  const { currentIndex, questions } = useSelector((state) => state.quizReducer);
  const dispatch = useDispatch();
  const toast = useToast();

  // if the user doesn't knows the answer then show him the next Q
  // and show up a toast
  function userDoesNotKnowTheAnswer() {
    dispatch(DONT_KNOW());
    dispatch(NEXT_QUESTION());
    toast({ status: "info", description: "You don't know the answer" });
  }

  // if the user knows the answer
  function useKnowsTheAnswer() {
    setUserKnowsAnswer(true);
  }

  // for handling option click
  function checkAnswer(usersAnswer, questionId) {
    const isCorrectAnswer = questions[currentIndex].answer === usersAnswer;

    if (isCorrectAnswer) {
      toast({ status: "success", description: "Correct Answer" });
      // updating the database
      fetch(`${config.serverURL}/get_quiz/correctAnswer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ questionId }),
      })
        .then((res) => res.json())
        .then((body) => {
          dispatch(LOGIN(body.user));
          toast({ status: "success", description: body.msg });
        })
        .catch((err) =>
          toast({
            status: "error",
            description: err.message || "We are having unexpected server side errors",
          })
        );
      // changing the score
      dispatch(CHANGE_SCORE());
    } else {
      dispatch(WRONG_ANSWER());
      toast({ status: "error", description: "Wrong Answer" });
    }
  }

  useEffect(() => {
    setUserKnowsAnswer(false);
  }, [currentIndex]);

  return (
    <Flex w="full" h="full" direction="column">
      <Heading
        whiteSpace="pre-wrap"
        fontSize="1xl"
        borderBottom="1px solid"
        borderColor="GrayText"
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
              <Button onClick={userDoesNotKnowTheAnswer} colorScheme="red">
                I Don't know :(
              </Button>
            </Tooltip>
          </Flex>
        </Flex>
      ) : (
        // if the user knows the answer, then shop up the options
        <Flex w="full" h="full" justify="center" direction="column" gridRowGap={2}>
          {questions[currentIndex].options.map((option, index) => {
            return (
              <Box
                onClick={() => checkAnswer(option, questions[currentIndex]._id)}
                cursor="pointer"
                w="full"
                p={5}
                _hover={{ background: "gray.200" }}
                transition=".3s"
                key={index}
                bg="gray.50"
                rounded={5}
              >
                {option}
              </Box>
            );
          })}
        </Flex>
      )}
    </Flex>
  );
};

export default QuizArea;
