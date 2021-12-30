import { Flex, Heading } from "@chakra-ui/layout";
import { Text } from "@chakra-ui/react";
import { Button } from "@chakra-ui/button";
import { useHistory } from "react-router-dom";
import useToast from "../../hooks/useToast";
import config from "../../config";
import { useDispatch } from "react-redux";
import { LOGIN } from "../../redux/actions/authActions";

export default function PaymentSuccess({ location }) {
  const history = useHistory();
  const toast = useToast();
  const dispatch = useDispatch();
  const { course, type } = location.state;

  async function startLearning() {
    try {
      const res = await fetch(`${config.serverURL}/get_auth/checkLogin`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const body = await res.json();
      if (res.ok) {
        dispatch(LOGIN(body));
        let pushPath = location.state.checking
          ? `quiz/${course._id}`
          : type === "course"
          ? `alc/${course._id}`
          : `activation_phase/${course._id}`;
        history.push(`/dashboard/${pushPath}`);
      } else {
        toast({ status: "error", description: body.msg });
      }
    } catch (err) {
      toast({ status: "error", description: err.message });
    }
  }
  return (
    <Flex w="full" h="full" justify="center" align="center" direction="column">
      <Heading mb={3} fontSize="2xl" fontWeight="normal" textAlign="center">
        Thanks for Purchasing "{course.name}"{" "}
        <span>{type === "package" ? "Question Pack" : ""}</span>
      </Heading>
      <Text mb={5}>
        {type === "course"
          ? "Now You can access everything in this course"
          : "Now you can start learning your unknown questions"}
      </Text>
      <Button onClick={startLearning} colorScheme="secondary" color="black">
        {type === "course" ? "Start Learning" : "Start Activation Phase"}
      </Button>
    </Flex>
  );
}
