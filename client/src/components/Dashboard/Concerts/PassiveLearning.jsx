import { useEffect } from "react";
import { Flex } from "@chakra-ui/layout";
import { useSelector, useDispatch } from "react-redux";

import SpaceImage from "../../../assets/space.jpg";
import PassiveBgSound from "../../../assets/audios/passive-learning.mp3";

import { NEXT_WORD } from "../../../redux/actions/concertActions";

export default function PassiveLearning() {
  const { useDefaultAsset, assets, questions, currentIndex } = useSelector(
    (state) => state.concertReducer
  );
  const defaultAudio = new Audio(PassiveBgSound);
  const dispatch = useDispatch();

  function repeatAudios(index) {
    const passiveLearningAudio = new Audio(questions[index].passiveLearningVoice);
    setTimeout(() => {
      passiveLearningAudio.currentTime = 0;
      passiveLearningAudio.play();
      passiveLearningAudio.onended = () => {
        setTimeout(() => {
          passiveLearningAudio.currentTime = 0;
          passiveLearningAudio.play();
          passiveLearningAudio.onended = () => {
            dispatch(NEXT_WORD());
          };
        }, 1000);
      };
    }, 500);
  }

  function playBgAudio() {
    if (useDefaultAsset) {
      defaultAudio.currentTime = 0;
      defaultAudio.volume = 0.2;
      defaultAudio.play();
    } else {
      assets.passiveLearningBgAudio.currentTime = 0;
      assets.passiveLearningBgAudio.volume = 0.2;
      assets.passiveLearningBgAudio.play();
    }
  }

  function stopBgAudio() {
    if (useDefaultAsset) {
      defaultAudio.pause();
    } else {
      assets.passiveLearningBgAudio.pause();
    }
  }

  useEffect(() => {
    playBgAudio();
    return () => {
      stopBgAudio()
    }; 
  }, []);

  return (
    <Flex direction="column" w="full" h="full">
      <img
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
        src={useDefaultAsset ? SpaceImage : assets.passiveLearningImage}
      />
      <audio
        src={questions[currentIndex].passiveLearningMaleVoice}
        onEnded={() => repeatAudios(currentIndex)}
        autoPlay
      />
    </Flex>
  );
}
