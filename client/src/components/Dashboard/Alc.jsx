import { useEffect, useState } from "react";
import { Flex } from "@chakra-ui/layout";
import { Spinner } from "@chakra-ui/spinner";
import useToast from "../../hooks/useToast";
import config from "../../config";

import NoMessage from "../global/NoMessage";

const Alc = () => {
  const [item, setItem] = useState({});
  const [loading, setLoading] = useState(true);

  const [videoEnded, setVideoEnded] = useState(false);

  const toast = useToast();

  async function fetchItem(abortController) {
    try {
      const res = await fetch(`${config.serverURL}/active_learning_concert/getRandomItem`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        signal: abortController.signal,
      });
      const body = await res.json();

      if (res.ok) {
        setItem(body.item);
        setLoading(false);
      }
    } catch (err) {
      toast({ status: "error", description: err.message });
    }
  }

  useEffect(() => {
    const abortController = new AbortController();
    document.title = `${config.appName} - Active Learning Concert`;
    fetchItem(abortController);
    return () => {
      setLoading(true);
      abortController.abort();
    };
  }, []);

  if (loading) {
    return (
      <Flex w="full" h="full" justify="center" align="center">
        <Spinner />
      </Flex>
    );
  }

  if (!item || !item.video) {
    return <NoMessage message="No Concerts Found" />;
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
            src={item.passive_gif.url}
            alt={item.passive_gif.name}
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
          <audio src={item.audio.url} autoPlay></audio>
          <audio
            src={item.passive_background_sound.url}
            autoPlay
            onCanPlay={(e) => (e.target.volume = 0.1)}
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
              onEnded={() => setVideoEnded(true)}
              muted
            ></video>
          </Flex>
          <audio loop src={item.audio.url} autoPlay />
          <audio
            loop
            src={item.background_music.url}
            onCanPlay={(e) => (e.target.volume = 0.1)}
            autoPlay
          />
        </Flex>
      )}
    </Flex>
  );
};

export default Alc;
