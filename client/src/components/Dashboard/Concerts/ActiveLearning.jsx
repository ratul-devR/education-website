import { useEffect, useState, useRef } from "react";
import { IconButton } from "@chakra-ui/button";
import { Flex, Heading } from "@chakra-ui/layout";
import { Text } from "@chakra-ui/react";
import { useSelector, useDispatch } from "react-redux";
import { BiMicrophone } from "react-icons/bi";
import { Tooltip } from "@chakra-ui/tooltip";
import { FiPlay, FiPause } from "react-icons/fi";
import { motion } from "framer-motion";

import { NEXT_WORD } from "../../../redux/actions/concertActions";

export default function ActiveLearning() {
  const { questions, currentIndex, assets } = useSelector((state) => state.concertReducer);
  const dispatch = useDispatch();
  const [showMic, setShowMic] = useState(false);
  const [showTranslation, setShowTranslation] = useState(true);
  const [playing, setPlaying] = useState(true);
  const [audioPlayedCount, setAudioPlayedCount] = useState(0); // if = 1 then go to the next word
  const backgroundAudioRef = useRef();
  const learningAudioRef = useRef();

  function fadeBgSound(start) {
    if (start) {
      backgroundAudioRef.current.volume = 0.2;
      setTimeout(() => {
        backgroundAudioRef.current.volume = 0.3;
        setTimeout(() => {
          backgroundAudioRef.current.volume = 0.4;
          setTimeout(() => {
            backgroundAudioRef.current.volume = 0.5;
          });
        }, 100);
      }, 100);
    } else {
      backgroundAudioRef.current.volume = 0.4;
      setTimeout(() => {
        backgroundAudioRef.current.volume = 0.3;
        setTimeout(() => {
          backgroundAudioRef.current.volume = 0.2;
          setTimeout(() => {
            backgroundAudioRef.current.volume = 0.1;
          }, 100);
        }, 100);
      }, 100);
    }
  }

  function handleAudioEnd() {
    fadeBgSound(true);
    setAudioPlayedCount((pre) => pre + 1);
    const shouldPlayNext = audioPlayedCount + 1 > 1;

    if (shouldPlayNext) {
      setTimeout(() => {
        dispatch(NEXT_WORD());
      }, 1000);
    } else {
      setShowMic(true);
      setShowTranslation(false);
      fadeBgSound(true);
      setTimeout(() => {
        setShowMic(false);
        setShowTranslation(false);
        fadeBgSound(false);
        learningAudioRef.current.play();
      }, 3000);
    }
  }

  function handleControlClick() {
    const learningAudio = learningAudioRef.current;
    const backgroundAudio = backgroundAudioRef.current;

    if (learningAudio.paused && backgroundAudio.paused) {
      learningAudio.play();
      backgroundAudio.play();
      setPlaying(true);
    } else {
      backgroundAudio.pause();
      learningAudio.pause();
      setPlaying(false);
    }
  }

  useEffect(() => {
    return () => {
      setShowMic(false);
      setShowTranslation(true);
      setAudioPlayedCount(0);
    };
  }, [currentIndex]);

  return (
    <Flex position="relative" direction="column" w="full" h="full" justify="center" align="center">
      {/* the full screen button */}
      {!showMic && (
        <motion.div
          whileHover={{ opacity: 1, transition: { duration: 0.2 } }}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "#00000015",
            opacity: 0,
          }}
        >
          <IconButton
            icon={playing ? <FiPause /> : <FiPlay />}
            colorScheme="secondary"
            color="black"
            size="lg"
            rounded={100}
            onClick={handleControlClick}
          />
        </motion.div>
      )}

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
        ref={learningAudioRef}
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
