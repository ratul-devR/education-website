import { useEffect, useState } from "react";
import { Flex, Heading } from "@chakra-ui/layout";
import { Text } from "@chakra-ui/react";
import { useSelector, useDispatch } from "react-redux";
import { BiMicrophone } from "react-icons/bi";
import { Tooltip } from "@chakra-ui/tooltip";

import { NEXT_WORD } from "../../../redux/actions/concertActions";

import activeLearningDefaultAudio from "../../../assets/audios/active-learning.mp3";

export default function ActiveLearning() {
  const { questions, currentIndex, assets, useDefaultAsset } = useSelector(
    (state) => state.concertReducer
  );
  const dispatch = useDispatch();
  const [showMic, setShowMic] = useState(false);
  const [showTranslation, setShowTranslation] = useState(true);

  const defaultAudio = new Audio(activeLearningDefaultAudio);

  function playBgSound() {
    if (assets.activeLearningBgAudio) {
      assets.activeLearningBgAudio.currentTime = 0;
      assets.activeLearningBgAudio.volume = 0.2;
      assets.loop = true
      assets.activeLearningBgAudio.play();
    } else if (useDefaultAsset) {
      defaultAudio.currentTime = 0;
      defaultAudio.volume = 0.2;
      defaultAudio.loop = true
      defaultAudio.play();
    }
  }

  function stopBgSound() {
    if (assets.activeLearningBgAudio) {
      assets.activeLearningBgAudio.pause();
    } else if (useDefaultAsset) {
      defaultAudio.pause();
    }
  }

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
    playBgSound();
    return () => stopBgSound();
  }, []);

  useEffect(() => {
    return () => {
      setShowMic(false);
      setShowTranslation(true);
    };
  }, [currentIndex]);

  return (
    <Flex direction="column" w="full" h="full" justify="center" align="center">
      <Heading color="primary" fontSize={100} mb={5}>
        {questions[currentIndex].answers[0]}
      </Heading>

      {showMic && (
        <Tooltip hasArrow label="Try pronouncing yourself">
          <Heading fontSize={50} color="GrayText">
            <BiMicrophone />
          </Heading>
        </Tooltip>
      )}

      {showTranslation && (
        <Text mb={10} color="GrayText" fontSize="2xl">
          {questions[currentIndex].question}
        </Text>
      )}

      <audio autoPlay onEnded={handleAudioEnd} src={questions[currentIndex].activeLearningVoice} />
    </Flex>
  );
}
