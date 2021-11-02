import { Box, Flex, Grid, Heading } from "@chakra-ui/layout";
import { Link } from "react-router-dom";
import { Link as ChakraLink, Text, Progress } from "@chakra-ui/react";
import { Button } from "@chakra-ui/button";
import { Spinner } from "@chakra-ui/spinner";
import { useEffect, useState } from "react";

import LearnImage from "../../assets/learn.svg";
import useToast from "../../hooks/useToast";
import config from "../../config";
import { useSelector } from "react-redux";

const UserCourses = () => {
  const { user } = useSelector((state) => state.authReducer);

  // if (courses && courses.length > 0) {
  //   return <Flex direction="column"></Flex>;
  // } else {
  //   return (
  //     <Flex w="full" h="full" justify="center" align="center" direction="column">
  //       <img
  //         src={LearnImage}
  //         alt="Learn Illustration"
  //         style={{ display: "block", width: "100%", maxWidth: "400px" }}
  //       />
  //       <Heading textAlign="center" fontSize="xl" fontWeight="normal" mt={10}>
  //         You don't have purchased any questions yet. Purchase some{" "}
  //         <ChakraLink as={Link} to="/dashboard/courses" color="teal">
  //           Courses
  //         </ChakraLink>
  //       </Heading>
  //     </Flex>
  //   );
  // }
  return (
    <div>
      <h1>all of your courses will be here</h1>
      {user.role == "organization" && (
        <p>
          Organization affiliate link:{" "}
          <a href={user.affiliateLink} target="_blank" rel="noopener noreferrer">
            {user.affiliateLink}
          </a>
          <br />
          <br />
          <br />
          total redirects: {user.referCount}
        </p>
      )}
    </div>
  );
};

export default UserCourses;
