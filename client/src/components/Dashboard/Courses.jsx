import { useEffect, useState } from "react";
import { Spinner } from "@chakra-ui/spinner";
import { Flex, SimpleGrid, Box } from "@chakra-ui/layout";
import { Heading, Text } from "@chakra-ui/react";
import { Button } from "@chakra-ui/button";
import { Link } from "react-router-dom";

import useToast from "../../hooks/useToast";

import config from "../../config";

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  // for getting all the courses
  async function getCourses(abortController) {
    try {
      const res = await fetch(`${config.serverURL}/get_courses/`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        signal: abortController.signal,
      });
      const body = await res.json();

      if (res.ok) {
        setCourses(body.courses);
        setLoading(false);
      } else {
        toast({ status: "error", description: body.msg || "Cannot load courses" });
      }
    } catch (err) {
      toast({ status: "error", description: err.message });
    }
  }

  // for adding a course
  useEffect(() => {
    const abortController = new AbortController();

    getCourses(abortController);

    document.title = `${config.appName} - Courses`;

    return () => abortController.abort();
  }, []);

  if (loading) {
    return (
      <Flex w="full" h="full" justify="center" align="center">
        <Spinner />
      </Flex>
    );
  }

  return (
    <Flex direction="column">
      <Heading mb={5} fontSize="2xl" fontWeight="normal" color="primary">
        Courses
      </Heading>

      <SimpleGrid columns={{ lg: 2, sm: 1, xl: 3, md: 2 }} spacing={3}>
        {courses &&
          courses.length > 0 &&
          courses.map((course) => {
            return (
              <Box border="1px solid" borderColor="gray.200" rounded={3} p={5} key={course._id}>
                {/* box header containing the button and the course name */}
                <Flex justifyContent="space-between" alignItems="flex-start" mb={3}>
                  <Heading fontWeight="normal" fontSize="xl">
                    {course.name}
                  </Heading>
                  <Button as={Link} to={`/dashboard/pay/${course._id}`} colorScheme="secondary">
                    Get
                  </Button>
                </Flex>
                {/* the course description */}
                <Text as="p" whiteSpace="pre-wrap">
                  {course.description}
                </Text>
                {/* box footer containing some course details like question count etc */}
                <Heading fontSize="md" fontWeight="normal" color="primary" mt={3}>
                  {course.questions.length} Questions
                </Heading>
              </Box>
            );
          })}
      </SimpleGrid>
    </Flex>
  );
};

export default Courses;