import { useEffect, useState, useRef } from "react";
import { Flex, Heading } from "@chakra-ui/layout";
import { Text } from "@chakra-ui/react";
import { useSelector, useDispatch } from "react-redux";

import { NEXT_WORD } from "../../../redux/actions/concertActions";

import activeLearningDefaultAudio from "../../../assets/audios/active-learning.mp3";

export default function ActiveLearning() {
  const { questions, currentIndex, assets, useDefaultAsset } = useSelector(
    (state) => state.concertReducer
  );
  const [currentPlayedCount, setCurrentPlayedCount] = useState(0);
  const questionAudioRef = useRef();
  const dispatch = useDispatch();

  const defaultAudio = new Audio(activeLearningDefaultAudio);

  function playBgSound() {
    if (assets.activeLearningBgAudio) {
      assets.activeLearningBgAudio.currentTime = 0;
      assets.activeLearningBgAudio.volume = 0.2;
      assets.activeLearningBgAudio.play();
    } else if (useDefaultAsset) {
      defaultAudio.currentTime = 0;
      defaultAudio.volume = 0.2;
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
    setCurrentPlayedCount((pre) => pre + 1);
    if (currentPlayedCount + 1 === 2) {
      dispatch(NEXT_WORD());
    } else {
      setTimeout(() => questionAudioRef.current.play(), 1000);
    }
  }

  useEffect(() => {
    playBgSound();
    return () => stopBgSound();
  }, []);

  useEffect(() => {
    setCurrentPlayedCount(0);
  }, [currentIndex]);

  return (
    <Flex direction="column" w="full" h="full" justify="center" align="center">
      <Heading color="primary" fontSize={100} mb={5}>
        {questions[currentIndex].answers[0]}
      </Heading>
      <Text mb={10} color="GrayText" fontSize="2xl">
        {questions[currentIndex].question}
      </Text>
      <audio
        autoPlay
        ref={questionAudioRef}
        onEnded={handleAudioEnd}
        src={questions[currentIndex].activeLearningVoice}
        controls
      />
    </Flex>
  );
}
