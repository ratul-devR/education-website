import { useState, useEffect } from "react";
import { Flex, Heading, SimpleGrid } from "@chakra-ui/layout";
import { Text } from "@chakra-ui/react";
import useToast from "../../hooks/useToast";
import config from "../../config";
import { Spinner } from "@chakra-ui/spinner";
import { Button } from "@chakra-ui/button";
import { Link, useHistory, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function AllAlcItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { courseId } = useParams();
  const { t } = useTranslation();
  const toast = useToast();
  const history = useHistory();

  async function fetchAlcItems() {
    try {
      const res = await fetch(`${config.serverURL}/active_learning_concert`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
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

  async function fetchQuestions() {
    try {
      const res = await fetch(`${config.serverURL}/get_quiz/getUserUnknownQuestions/${courseId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const body = await res.json();

      if (res.ok) {
        // if the user has questions in his learning pack and if he doesn't have anything to learn
        // if the user has the number of questions that is determined by the admin in his not known DB,
        // then ask for payment
        if (body.unknownQuestionsPack.length > 0 && !body.learningQuestions.length) {
          history.push(`/dashboard/buyPackage/${courseId}`, { phase: "learning" });
        }
      } else {
        toast({ status: "error", description: body.msg });
      }
    } catch (err) {
      toast({ status: "error", description: err.message });
    }
  }

  useEffect(() => {
    fetchQuestions().then(() => fetchAlcItems());
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
        <Text>You will have to proceed without music</Text>
        <Button
          colorScheme="secondary"
          color="black"
          as={Link}
          to={`/dashboard/alc/default/${courseId}`}
        >
          Start Concert
        </Button>
      </Flex>
    );
  }

  return (
    <Flex direction="column">
      <Heading fontSize="2xl" fontWeight="normal" mb={5} color="primary">
        {t("audio_tracks")}
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
