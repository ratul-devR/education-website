import { useRef, useState } from "react";
import { Flex } from "@chakra-ui/layout";
import { useSelector, useDispatch } from "react-redux";
import { FiPlay, FiPause } from "react-icons/fi";
import { motion } from "framer-motion";
import { IconButton } from "@chakra-ui/button";
import $ from "jquery";

import { NEXT_WORD } from "../../../redux/actions/concertActions";

export default function PassiveLearning() {
  const { assets, questions, currentIndex } = useSelector((state) => state.concertReducer);
  const [playing, setPlaying] = useState(true);
  const [wasPlaying, setWasPlaying] = useState();
  const dispatch = useDispatch();
  const backgroundAudioRef = useRef();
  const learningAudioRef = useRef();
  const learningMaleAudioRef = useRef();

  function fadeIn() {
    $("#background-sound").animate({ volume: 0.2 }, 2500);
  }

  function fadeOut() {
    $("#background-sound").animate({ volume: 0 }, 6500);
  }

  function fadeBgSound(start) {
    if (start) {
      fadeIn();
    } else {
      fadeOut();
    }
  }

  function handleMaleAudioEnd() {
    const learningAudio = learningAudioRef.current;

    learningAudio && learningAudio.play();

    learningAudio.onended = () => {
      setTimeout(() => {
        learningAudio && learningAudio.play();
        if (currentIndex + 1 === questions.length) {
          fadeBgSound(false);
        }
        learningAudio.onended = () => {
          setTimeout(() => {
            if (learningAudio) {
              dispatch(NEXT_WORD());
            }
          }, 1000);
        };
      }, 3000);
    };
  }

  function handleControlClick() {
    const bgAudio = backgroundAudioRef.current;
    const learningAudio = learningAudioRef.current;
    const maleAudio = learningMaleAudioRef.current;

    if (bgAudio.paused) {
      bgAudio.play();
      if (wasPlaying) {
        wasPlaying.play();
      }
      setPlaying(true);
    } else {
      bgAudio.pause();
      learningAudio.pause();
      maleAudio.pause();
      setPlaying(false);
    }
  }

  return (
    <Flex position="relative" direction="column" w="full" h="full">
      <motion.div
        whileHover={{ opacity: 1, transition: { duration: 0.2 } }}
        style={{
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "flex-end",
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "#00000010",
          opacity: 0,
          padding: "20px",
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

      {assets.passiveLearningImage && (
        <img
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          src={assets.passiveLearningImage}
        />
      )}

      <audio
        src={questions[currentIndex].passiveLearningMaleVoice}
        onPlay={(e) => {
          setWasPlaying(e.target);
        }}
        onEnded={handleMaleAudioEnd}
        autoPlay
        ref={learningMaleAudioRef}
      />
      <audio
        src={questions[currentIndex].passiveLearningVoice}
        onPlay={(e) => {
          setWasPlaying(e.target);
        }}
        ref={learningAudioRef}
      />

      {assets.passiveLearningBgAudio && (
        <audio
          onCanPlay={(e) => {
            e.target.volume = 0;
            fadeBgSound(true);
          }}
          id="background-sound"
          loop
          src={assets.passiveLearningBgAudio}
          autoPlay
          ref={backgroundAudioRef}
        />
      )}
    </Flex>
  );
}
