import { Flex, Heading, SimpleGrid, Box } from "@chakra-ui/layout";
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
  const [allPackages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();
  const toast = useToast();

  async function fetchCourses() {
    try {
      const res = await fetch(`${config.serverURL}/get_courses`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const body = await res.json();
      if (res.ok) {
        setCourses(body.courses);
      } else {
        toast({ status: "error", description: body.msg || "Unexpected Server Side Error" });
      }
    } catch (err) {
      toast({ status: "error", description: err.message });
    }
  }

  async function fetchPackages() {
    try {
      const res = await fetch(`${config.serverURL}/package_api`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const body = await res.json();

      if (res.ok) {
        setPackages(body.packages);
      } else {
        toast({ status: "error", description: body.msg });
      }
    } catch (err) {
      toast({ status: "error", description: err.message });
    }
  }

  useEffect(() => {
    fetchCourses().then(() => fetchPackages().then(() => setLoading(false)));

    document.title = `${config.appName} - ${t(title)}`;

    return () => {
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
    <Box overflowX={"hidden"} w="full" h="full">
      <Box height={"auto"}>
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
      </Box>

      <Box height={"auto"}>
        <Heading color="primary" fontWeight="normal" fontSize="xl" mb={5}>
          {t("package_heading")}
        </Heading>
        {allPackages && allPackages.length ? (
          <SimpleGrid pb={5} columns={[1, 1, 2, 3]} spacing={5}>
            {allPackages.map((item) => {
              return (
                <Button
                  as={Link}
                  key={item._id}
                  to={`/dashboard/package/${item._id}`}
                  colorScheme="packageButton"
                  p={10}
                  whiteSpace="normal"
                  textAlign="center"
                  height="auto"
                >
                  {item.name}
                </Button>
              );
            })}
          </SimpleGrid>
        ) : (
          <NoMessage message={"No Packages Found"} />
        )}
      </Box>
    </Box>
  );
};

export default UserCourses;
