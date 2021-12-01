import { Flex, Heading } from "@chakra-ui/layout";
import { Text } from "@chakra-ui/react";
import { Button } from "@chakra-ui/button";
import { Link, useHistory } from "react-router-dom";
import useToast from "../../hooks/useToast";
import config from "../../config";
import { useDispatch } from "react-redux";
import { LOGIN } from "../../redux/actions/authActions";

export default function PaymentSuccess(props) {
  const history = useHistory();
  const toast = useToast();
  const dispatch = useDispatch();
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
        history.push(`/dashboard/alc/${props.location.state.course._id}`);
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
        Thanks for Purchasing "{props.location.state.course.name}"
      </Heading>
      <Text mb={5}>Now You can access everything in this course</Text>
      <Button as={Link} onClick={startLearning} colorScheme="secondary" color="black">
        Start Learning
      </Button>
    </Flex>
  );
}
