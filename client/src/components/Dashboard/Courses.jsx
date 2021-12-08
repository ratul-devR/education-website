import { Box, Flex, Heading, SimpleGrid } from "@chakra-ui/layout";
import { Link } from "react-router-dom";
import { Text, Spinner } from "@chakra-ui/react";
import { Button } from "@chakra-ui/button";
import { useEffect, useState } from "react";
import config from "../../config";
import useToast from "../../hooks/useToast";

import NoMessage from "../global/NoMessage";

const UserCourses = ({ title }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  async function fetchCourses(abortController) {
    try {
      const res = await fetch(`${config.serverURL}/get_courses`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        signal: abortController.signal,
      });
      const body = await res.json();
      if (res.ok) {
        setLoading(false);
        setCourses(body.courses);
      } else {
        toast({ status: "error", description: body.msg || "Unexpected Server Side Error" });
      }
    } catch (err) {
      toast({ status: "error", description: err.message });
    }
  }

  useEffect(() => {
    const abortController = new AbortController();
    fetchCourses(abortController);
    document.title = `${config.appName} - ${title}`;
    return () => {
      abortController.abort();
      setLoading(true);
    };
  }, [title]);

  if (loading) {
    return (
      <Flex w="full" h="full" justify="center" align="center">
        <Spinner />
      </Flex>
    );
  }

  return (
    <Flex direction="column" w="full" h="full">
      <Heading color="primary" fontWeight="normal" fontSize="xl" mb={5}>
        {title}
      </Heading>

      {courses && courses.length > 0 ? (
        <SimpleGrid pb={5} columns={[1, 1, 2, 3]} spacing={5}>
          {courses.map((course) => {
            return (
              <Box
                key={course._id}
                boxShadow="md"
                p={5}
                rounded={5}
                border="1px solid"
                borderColor="gray.200"
              >
                <Flex mb={3} justify="space-between" align="center">
                  <Heading noOfLines={1} fontSize="2xl" fontWeight="normal">
                    {course.name}
                  </Heading>
                  <Button
                    as={Link}
                    to={
                      title === "Checking Phase"
                        ? `/dashboard/quiz/${course._id}`
                        : `/dashboard/activation_phase/${course._id}`
                    }
                    colorScheme="secondary"
                    color="black"
                  >
                    Learn
                  </Button>
                </Flex>
                <Text color="GrayText" whiteSpace="pre-wrap">
                  {course.description}
                </Text>
              </Box>
            );
          })}
        </SimpleGrid>
      ) : (
        <NoMessage message="You don't own any course" />
      )}
    </Flex>
  );
};

export default UserCourses;
