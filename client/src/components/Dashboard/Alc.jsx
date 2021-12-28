import { useEffect, useState } from "react";
import { Flex, Heading } from "@chakra-ui/layout";
import { Spinner } from "@chakra-ui/spinner";
import useToast from "../../hooks/useToast";
import config from "../../config";
import { Button } from "@chakra-ui/button";
import { Link } from "react-router-dom";
import { useParams, useHistory } from "react-router-dom";
import { useSelector } from "react-redux";

// audios
import PassiveLearningBgSound from "../../assets/audios/passive-learning.mp3";
import ActiveLearningBgSound from "../../assets/audios/active-learning.mp3";

const Alc = (props) => {
  const [item, setItem] = useState({});
  const [hasAllPrerequisites, setHasAllPrerequisites] = useState(true);
  const [loading, setLoading] = useState(true);
  const { user } = useSelector((state) => state.authReducer);

  const [currentIndex, setCurrentIndex] = useState(0);

  const [timer, setTimer] = useState(0);

  const [videoEnded, setVideoEnded] = useState(false);
  const [videoPlayedCount, setVideoPlayedCount] = useState(0);
  const [concertEnded, setConcertEnded] = useState(false);

  const toast = useToast();
  const history = useHistory();
  // it can be the course id or the item/concert id
  const { courseId: id } = useParams();

  const path = props.location.state && props.location.state.id ? "id" : "getItem";

  async function fetchItem(abortController) {
    try {
      const res = await fetch(`${config.serverURL}/active_learning_concert/${path}/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        signal: abortController.signal,
      });
      const body = await res.json();

      if (res.ok) {
        if (!body.hasAllPrerequisites && user.role !== "admin") {
          setHasAllPrerequisites(false);
        } else if (!body.hasPurchased && user.role !== "admin") {
          history.push(`/dashboard/pay/${id}`);
        }
        setItem(body.item || null);
        setLoading(false);
      }
    } catch (err) {
      toast({ status: "error", description: err.message });
    }
  }

  async function handleConcertView(abortController) {
    try {
      await fetch(`${config.serverURL}/active_learning_concert/userViewedConcert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ concertId: item._id }),
        credentials: "include",
        signal: abortController.signal,
      });
    } catch (err) {
      toast({ status: "error", description: err.message });
    }
  }

  useEffect(() => {
    const abortController = new AbortController();
    document.title = `${config.appName} - Active and Passive Learning Concert`;
    fetchItem(abortController);
    return () => {
      setLoading(true);
      abortController.abort();
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((pre) => pre + 1);
    }, 1000);
    return () => {
      clearInterval(interval);
      setTimer(0);
    };
  }, [currentIndex, videoEnded]);

  useEffect(() => {
    if (
      item &&
      timer !== 0 &&
      item.timeout !== 0 &&
      timer === item.timeout &&
      !concertEnded &&
      videoEnded
    ) {
      setTimer(0);
      if (currentIndex + 1 < item.passive_images.length) {
        setCurrentIndex((pre) => pre + 1);
      } else {
        setVideoEnded(false);
      }
    }
  }, [timer]);

  useEffect(() => {
    const abortController = new AbortController();
    if (concertEnded && user.role !== "admin") {
      handleConcertView(abortController);
    }
    return () => abortController.abort();
  }, [concertEnded]);

  if (loading) {
    return (
      <Flex w="full" h="full" justify="center" align="center">
        <Spinner />
      </Flex>
    );
  }

  if (!hasAllPrerequisites && user.role !== "admin") {
    return (
      <Flex w="full" h="full" justify="center" align="center" direction="column">
        <Heading fontSize="9xl" mb={5}>
          😶
        </Heading>
        <Heading fontSize="2xl" color="GrayText" fontWeight="normal" mb={5}>
          You Don't have all the prerequisites to access this course.
        </Heading>
        <Button onClick={() => history.goBack()} colorScheme="secondary" color="black">
          Go Back
        </Button>
      </Flex>
    );
  }

  if (!item || !item.video) {
    return (
      <Flex w="full" h="full" justify="center" align="center" direction="column">
        <Heading mb={3} fontSize="2xl" color="GrayText" fontWeight="normal">
          No New Concerts Were Found
        </Heading>
        <Button
          colorScheme="secondary"
          color="black"
          as={Link}
          to={`/dashboard/activation_phase/${id}`}
        >
          Start Activation Phase
        </Button>
      </Flex>
    );
  }

  if (concertEnded) {
    return (
      <Flex w="full" h="full" justify="center" align="center" direction="column">
        <Heading fontSize="9xl" mb={5}>
          😄
        </Heading>
        <Heading mb={5} textAlign="center">
          The Concert has been ended
        </Heading>
        <Button
          colorScheme="secondary"
          color="black"
          as={Link}
          to={`/dashboard/activation_phase/${item.category}`}
        >
          Start Activation Phase
        </Button>
      </Flex>
    );
  }

  return (
    <Flex w="full" h="full" justify="center" align="center" direction="column">
      {videoEnded ? (
        <Flex
          w="full"
          justify="center"
          align="center"
          h="full"
          bg="gray.100"
          rounded={5}
          boxShadow="lg"
        >
          <img
            src={item.passive_images[currentIndex].url}
            alt={item.passive_images[currentIndex].name}
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
          <audio src={item.passive_audio.url} autoPlay></audio>
          <audio
            src={
              (item.passive_background_sound && item.passive_background_sound.url) ||
              PassiveLearningBgSound
            }
            autoPlay
            onCanPlay={(e) => (e.target.volume = 0.3)}
          ></audio>
        </Flex>
      ) : (
        <Flex w="full" h="full" direction="column">
          <Flex
            w="full"
            justify="center"
            align="center"
            h="full"
            bg="gray.100"
            rounded={5}
            boxShadow="lg"
          >
            <video
              style={{ width: "100%", height: "100%" }}
              src={item.video.url}
              autoPlay
              onEnded={() => {
                if (videoPlayedCount + 1 === 2) {
                  setConcertEnded(true);
                } else {
                  setVideoEnded(true);
                  setVideoPlayedCount((pre) => (pre += 1));
                }
              }}
              muted
            ></video>
          </Flex>
          <audio loop src={item.audio.url} autoPlay />
          <audio
            loop
            src={(item.background_music && item.background_music.url) || ActiveLearningBgSound}
            onCanPlay={(e) => (e.target.volume = 0.3)}
            autoPlay
          />
        </Flex>
      )}
    </Flex>
  );
};

export default Alc;
