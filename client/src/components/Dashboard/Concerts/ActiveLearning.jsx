import { useEffect, useState, useRef } from "react";
import { Flex, Heading } from "@chakra-ui/layout";
import { Text } from "@chakra-ui/react";
import { useSelector, useDispatch } from "react-redux";
import { BiMicrophone } from "react-icons/bi";
import { Tooltip } from "@chakra-ui/tooltip";

import { NEXT_WORD } from "../../../redux/actions/concertActions";

export default function ActiveLearning() {
  const { questions, currentIndex, assets } = useSelector((state) => state.concertReducer);
  const dispatch = useDispatch();
  const [showMic, setShowMic] = useState(false);
  const [showTranslation, setShowTranslation] = useState(true);
  const backgroundAudioRef = useRef();

  function fadeBgSound(start) {
    if (start) {
      backgroundAudioRef.current.volume = 0.2;
      setTimeout(() => {
        backgroundAudioRef.current.volume = 0.3;
        setTimeout(() => {
          backgroundAudioRef.current.volume = 0.4;
          setTimeout(() => {
            backgroundAudioRef.current.volume = 0.5;
          })
        }, 100)
      }, 100)
    } else {
      backgroundAudioRef.current.volume = 0.4;
      setTimeout(() => {
        backgroundAudioRef.current.volume = 0.3;
        setTimeout(() => {
          backgroundAudioRef.current.volume = 0.2;
          setTimeout(() => {
            backgroundAudioRef.current.volume = 0.1;
          }, 100)
        }, 100)
      }, 100)
    }
  }

  function handleAudioEnd() {
    setShowMic(true);
    setShowTranslation(false);
    fadeBgSound(true)
    setTimeout(() => {
      setShowMic(false);
      const questionAudio = new Audio(questions[currentIndex].activeLearningVoice);
      fadeBgSound(false)
      questionAudio.currentTime = 0;
      questionAudio.play();
      questionAudio.onended = () =>
        setTimeout(() => {
          fadeBgSound(true)
          dispatch(NEXT_WORD());
        }, 1000);
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
      <Heading
        color="primary"
        fontWeight="normal"
        fontSize={questions[currentIndex].spanishWord ? 50 : 100}
        mb={5}
      >
        {/*
          If the question type is text, then show up the text
          otherwise show up the mcq answer with translation
          if the question type is text and is has a spanish word, then
          show up the text answer with spanish word
        */}
        {questions[currentIndex].type === "text"
          ? questions[currentIndex].spanishWord && questions[currentIndex].englishVerb
            ? questions[currentIndex].englishVerb + " - " + questions[currentIndex].spanishWord
            : questions[currentIndex].answers[0]
          : questions[currentIndex].answers[0]}
      </Heading>

      {showMic && (
        <Tooltip hasArrow label="Try pronouncing yourself">
          <Heading fontSize={50} color="GrayText">
            <BiMicrophone />
          </Heading>
        </Tooltip>
      )}

      {/* the translation appears here */}
      {showTranslation && !questions[currentIndex].spanishWord && (
        <Text mb={10} color="GrayText" fontSize="2xl">
          {questions[currentIndex].question.replaceAll("_", "")}
        </Text>
      )}

      {/* the audio which plays the question sound */}
      <audio
        autoPlay
        onPlay={() => fadeBgSound(false)}
        onEnded={handleAudioEnd}
        src={questions[currentIndex].activeLearningVoice}
      />

      {/* the background music */}
      {assets.activeLearningBgAudio && (
        <audio
          autoPlay
          loop
          ref={backgroundAudioRef}
          onCanPlay={(e) => (e.target.volume = 0.5)}
          src={assets.activeLearningBgAudio}
        />
      )}
    </Flex>
  );
}
