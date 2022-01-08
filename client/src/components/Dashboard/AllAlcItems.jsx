import { useState, useEffect } from "react";
import { Flex, Heading, SimpleGrid } from "@chakra-ui/layout";
import { Text } from "@chakra-ui/react";
import useToast from "../../hooks/useToast";
import config from "../../config";
import { Spinner } from "@chakra-ui/spinner";
import { Button } from "@chakra-ui/button";
import { Link, useParams } from "react-router-dom";

export default function AllAlcItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { courseId } = useParams();
  const toast = useToast();

  async function fetchAlcItems(abortController) {
    try {
      const res = await fetch(`${config.serverURL}/active_learning_concert/courseId/${courseId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        signal: abortController.signal,
        credentials: "include",
      });
      const body = await res.json();
      if (res.ok) {
        setItems(body.items);
        setLoading(false);
      } else {
        toast({ status: "error", description: body.msg });
      }
    } catch (err) {
      toast({ status: "error", description: err.message });
    }
  }

  useEffect(() => {
    const abortController = new AbortController();
    fetchAlcItems(abortController);
    return () => abortController.abort();
  }, []);

  if (loading) {
    return (
      <Flex w="full" h="full" justify="center" align="center">
        <Spinner />
      </Flex>
    );
  } else if (items.length === 0) {
    return (
      <Flex w="full" direction="column" gridGap={3} h="full" justify="center" align="center">
        <Heading color="GrayText" fontWeight="normal" fontSize="2xl">
          No Learning Tracks Found{" "}
        </Heading>
        <Text>You will have to proceed with the default one</Text>
        <Button colorScheme="secondary" color="black" as={Link} to={`/dashboard/alc/default/${courseId}`}>
          Start Concert
        </Button>
      </Flex>
    );
  }

  return (
    <Flex direction="column">
      <Heading fontSize="2xl" fontWeight="normal" mb={5} color="primary">
        Tracks
      </Heading>
      <SimpleGrid columns={[1, 1, 2, 3]} spacing={5}>
        {items.map((item) => {
          return (
            <Button
              as={Link}
              to={`/dashboard/alc/${item._id}/${courseId}`}
              p={10}
              colorScheme="secondary"
              color="black"
              key={item._id}
            >
              {item.name}
            </Button>
          );
        })}
      </SimpleGrid>
    </Flex>
  );
}
