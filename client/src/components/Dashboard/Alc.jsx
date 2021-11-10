import { useEffect, useState } from "react";
import { Flex } from "@chakra-ui/layout";
import { Spinner } from "@chakra-ui/spinner";
import useToast from "../../hooks/useToast";
import config from "../../config";
import AudioPlayer from "react-audio-player";

const Alc = () => {
  const [item, setItems] = useState();
  const [loading, setLoading] = useState(true);

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
        setItems(body.item);
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

  if (!item) {
    return <h1>No Concerts found</h1>;
  }

  return (
    <Flex w="full" h="full" justify="center" align="center" direction="column">
      <Flex
        w="full"
        justify="center"
        align="center"
        h="full"
        bg="gray.100"
        rounded={5}
        boxShadow="lg"
      >
        {/* <video
          loop
          style={{ width: "100%", height: "100%" }}
          src={item.video.url}
          autoPlay
          muted
          onLoadStart={() => toast({ status: "info", description: "Loading up the video..." })}
        ></video> */}
        <h1>Concert will be here</h1>
      </Flex>
      {/* <AudioPlayer src={item.audio.url} loop autoPlay volume={1} />
      <AudioPlayer src={item.background_music.url} loop autoPlay volume={0.1} /> */}
    </Flex>
  );
};

export default Alc;
