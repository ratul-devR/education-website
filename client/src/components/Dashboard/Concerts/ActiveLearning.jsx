import { useEffect, useState } from "react";
import { Flex, Heading } from "@chakra-ui/layout";
import { Text } from "@chakra-ui/react";
import { useSelector, useDispatch } from "react-redux";
import { BiMicrophone } from "react-icons/bi";
import { Tooltip } from "@chakra-ui/tooltip";

import { NEXT_WORD } from "../../../redux/actions/concertActions";

import activeLearningDefaultAudio from "../../../assets/audios/active-learning.mp3";

export default function ActiveLearning() {
  const { questions, currentIndex, assets, useDefaultAsset, course, activeLearningPlayedBefore } =
    useSelector((state) => state.concertReducer);
  const dispatch = useDispatch();
  const [showMic, setShowMic] = useState(false);
  const [showTranslation, setShowTranslation] = useState(true);

  function handleAudioEnd() {
    setShowMic(true);
    setShowTranslation(false);
    setTimeout(() => {
      setShowMic(false);
      const questionAudio = new Audio(questions[currentIndex].activeLearningVoice);
      questionAudio.currentTime = 0;
      questionAudio.play();
      questionAudio.onended = () => setTimeout(() => dispatch(NEXT_WORD()), 1000);
    }, 3000);
  }

  useEffect(() => {
    return () => {
      setShowMic(false);
      setShowTranslation(true);
    };
  }, [currentIndex]);

  return (
    <Flex direction="column" w="full" h="full" justify="center" align="center">
      {currentIndex === 0 && !activeLearningPlayedBefore && (
        <Flex direction="column" mb={10} justify="center" align="center">
          <Heading fontWeight="normal" color="primary" color="blue.400" mb={5}>
            Instruction
          </Heading>
          <Text color="GrayText" whiteSpace="pre-wrap">
            {course.description}
          </Text>
        </Flex>
      )}

      <Heading
        color="primary"
        fontWeight={questions[currentIndex].type === "text" && "normal"}
        fontSize={questions[currentIndex].type === "text" ? 50 : 100}
        mb={5}
      >
        {questions[currentIndex].type === "text"
          ? questions[currentIndex].question.replace("_", " _____ ") +
            ` (${questions[currentIndex].answers[0]})`
          : questions[currentIndex].answers[0]}
      </Heading>

      {showMic && (
        <Tooltip hasArrow label="Try pronouncing yourself">
          <Heading fontSize={50} color="GrayText">
            <BiMicrophone />
          </Heading>
        </Tooltip>
      )}

      {showTranslation && questions[currentIndex].type === "mcq" && (
        <Text mb={10} color="GrayText" fontSize="2xl">
          {questions[currentIndex].question.replace("_", " _____ ")}
        </Text>
      )}

      <audio autoPlay onEnded={handleAudioEnd} src={questions[currentIndex].activeLearningVoice} />
      <audio
        autoPlay
        loop
        onCanPlay={(e) => (e.target.volume = 0.2)}
        src={useDefaultAsset ? activeLearningDefaultAudio : assets.activeLearningBgAudio}
      />
    </Flex>
  );
}