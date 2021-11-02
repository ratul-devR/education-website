import { useEffect, useState } from "react";
import { Spinner } from "@chakra-ui/spinner";
import { Flex, Grid, Box } from "@chakra-ui/layout";
import { Heading, Text } from "@chakra-ui/react";
import { Button } from "@chakra-ui/button";
import { useHistory } from "react-router-dom";

import useToast from "../../hooks/useToast";

import config from "../../config";

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const history = useHistory();
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
  async function AddCourse(courseId) {
    try {
      const res = await fetch(`${config.serverURL}/get_courses/addCourse`, {
        method: "POST",
        body: JSON.stringify({ courseId }),
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const body = await res.json();

      if (res.ok) {
        history.push("/dashboard");
        toast({ status: "success", description: body.msg });
      } else {
        toast({ status: "error", description: body.msg || "Cannot load courses" });
      }
    } catch (err) {
      toast({ status: "error", description: err.message });
    }
  }

  useEffect(() => {
    const abortController = new AbortController();

    getCourses(abortController);

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
      <Heading mb={5} fontSize="2xl" fontWeight="normal" color="blue.600">
        Courses
      </Heading>

      <Grid gridTemplateColumns="repeat(auto-fit, minmax(300px, 1fr))" gridGap={3}>
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
                  <Button /* onClick={() => AddCourse(course._id)} */ colorScheme="blue">
                    Get
                  </Button>
                </Flex>
                {/* the course description */}
                <Text as="p" whiteSpace="pre-wrap">
                  {course.description}
                </Text>
                {/* box footer containing some course details like question count etc */}
                <Heading fontSize="md" fontWeight="normal" color="teal" mt={3}>
                  {course.questions.length} Questions
                </Heading>
              </Box>
            );
          })}
      </Grid>
    </Flex>
  );
};

export default Courses;
