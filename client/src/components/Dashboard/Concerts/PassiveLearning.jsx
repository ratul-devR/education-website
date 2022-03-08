import { useRef, useState } from "react";
import { Flex } from "@chakra-ui/layout";
import { useSelector, useDispatch } from "react-redux";
import { FiPlay, FiPause } from "react-icons/fi";
import { motion } from "framer-motion";
import { IconButton } from "@chakra-ui/button";

import { NEXT_WORD } from "../../../redux/actions/concertActions";

export default function PassiveLearning() {
  const { assets, questions, currentIndex } = useSelector((state) => state.concertReducer);
  const [playing, setPlaying] = useState(true);
  const [wasPlaying, setWasPlaying] = useState();
  const dispatch = useDispatch();
  const backgroundAudioRef = useRef();
  const learningAudioRef = useRef();
  const learningMaleAudioRef = useRef();

  function fadeIn(q) {
    if (q.volume) {
      var InT = 0;
      var setVolume = 0.2; // Target volume level for new song
      var speed = 0.005; // Rate of increase
      q.volume = InT;
      var eAudio = setInterval(function () {
        InT += speed;
        q.volume = InT.toFixed(1);
        if (InT.toFixed(1) >= setVolume) {
          clearInterval(eAudio);
          //alert('clearInterval eAudio'+ InT.toFixed(1));
        }
      }, 50);
    }
  }

  function fadeOut(q) {
    if (q.volume) {
      var InT = q.volume;
      var setVolume = 0; // Target volume level for old song
      var speed = 0.005; // Rate of volume decrease
      q.volume = InT;
      var fAudio = setInterval(function () {
        InT -= speed;
        q.volume = InT.toFixed(1);
        if (InT.toFixed(1) <= setVolume) {
          clearInterval(fAudio);
          //alert('clearInterval fAudio'+ InT.toFixed(1));
        }
      }, 110);
    }
  }

  function fadeBgSound(start) {
    if (start) {
      fadeIn(backgroundAudioRef.current);
    } else {
      fadeOut(backgroundAudioRef.current);
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
          onCanPlay={() => {
            fadeBgSound(true);
          }}
          loop
          src={assets.passiveLearningBgAudio}
          autoPlay
          ref={backgroundAudioRef}
        />
      )}
    </Flex>
  );
}
