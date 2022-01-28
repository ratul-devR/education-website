import { useRef } from "react"
import { Flex } from "@chakra-ui/layout";
import { useSelector, useDispatch } from "react-redux";

import { NEXT_WORD } from "../../../redux/actions/concertActions";

export default function PassiveLearning() {
  const {assets, questions, currentIndex} = useSelector((state) => state.concertReducer);
  const dispatch = useDispatch();
  const backgroundAudioRef = useRef()

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

  /*
    First play the passive learning voice immediately
    then play it again after 3 seconds
    then wait until 1 second and navigate into the next word
  */
  function repeatAudios(index) {
    const passiveLearningAudio = new Audio(questions[index].passiveLearningVoice);

    passiveLearningAudio.currentTime = 0;
    passiveLearningAudio.play();

    passiveLearningAudio.onended = () => {
    fadeBgSound(true)
      setTimeout(() => {
      fadeBgSound(false)
        passiveLearningAudio.currentTime = 0;
        passiveLearningAudio.play();
        passiveLearningAudio.onended = () => {
          fadeBgSound(true)
          setTimeout(() => {
            dispatch(NEXT_WORD());
          }, 1000);
        };
      }, 3000);
    };
  }

  return (
    <Flex direction="column" w="full" h="full">
      {assets.passiveLearningImage && (
        <img
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          src={assets.passiveLearningImage}
        />
      )}
      <audio
        src={questions[currentIndex].passiveLearningMaleVoice}
        onEnded={() => repeatAudios(currentIndex)}
        onPlay={() => fadeBgSound(false)}
        autoPlay
      />
      {assets.passiveLearningBgAudio && (
        <audio
          onCanPlay={(e) => (e.target.volume = 0.5)}
          loop
          src={assets.passiveLearningBgAudio}
          autoPlay
          ref={backgroundAudioRef}
        />
      )}
    </Flex>
  );
}
