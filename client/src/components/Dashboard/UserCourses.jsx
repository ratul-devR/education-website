import { Box, Flex, Heading, SimpleGrid } from "@chakra-ui/layout";
import { Link } from "react-router-dom";
import { Text } from "@chakra-ui/react";
import { Button } from "@chakra-ui/button";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import config from "../../config";

const UserCourses = () => {
  const { user } = useSelector((state) => state.authReducer);
  const courses = user.courses;

  useEffect(() => {
    document.title = `${config.appName} - Your courses`;
  }, []);

  return (
    <Flex direction="column" w="full" h="full">
      <Heading color="primary" fontWeight="normal" fontSize="2xl" mb={5}>
        Your courses
      </Heading>

      <SimpleGrid columns={[1, 1, 2, 3]} spacing={3}>
        {courses &&
          courses.length > 0 &&
          courses.map((course) => {
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
                  <Heading noOfLines={1} fontSize="xl" fontWeight="normal">
                    {course.name}
                  </Heading>
                  <Button as={Link} to={`/dashboard/quiz/${course._id}`} colorScheme="blue">
                    Learn
                  </Button>
                </Flex>
                <Text whiteSpace="pre-wrap">{course.description}</Text>
              </Box>
            );
          })}
      </SimpleGrid>
    </Flex>
  );
};

export default UserCourses;
