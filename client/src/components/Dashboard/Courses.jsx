import { Flex, Heading, SimpleGrid } from "@chakra-ui/layout";
import { Link } from "react-router-dom";
import { Spinner } from "@chakra-ui/react";
import { Button } from "@chakra-ui/button";
import { useEffect, useState } from "react";
import config from "../../config";
import useToast from "../../hooks/useToast";
import { useTranslation } from "react-i18next";

import NoMessage from "../global/NoMessage";

// this page will be used for multiple products
// on active and checking phase, concerts etc.
const UserCourses = ({ title, path }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();
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
    document.title = `${config.appName} - ${t(title)}`;
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
        {t("choose_learning_programme")}
      </Heading>

      {courses && courses.length > 0 ? (
        <SimpleGrid pb={5} columns={[1, 1, 2, 3]} spacing={5}>
          {courses.map((course) => {
            return (
              <Button
                as={Link}
                key={course._id}
                to={`/dashboard/${path}/${course._id}`}
                colorScheme="secondary"
                color="black"
                p={10}
                whiteSpace="normal"
                textAlign="center"
                fontSize={course.courseTextSize || "lg"}
                height="auto"
              >
                {course.name}
              </Button>
            );
          })}
        </SimpleGrid>
      ) : (
        <NoMessage message="No courses available" />
      )}
    </Flex>
  );
};

export default UserCourses;
