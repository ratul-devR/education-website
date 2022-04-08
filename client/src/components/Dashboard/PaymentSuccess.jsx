import { Flex, Heading, SimpleGrid } from "@chakra-ui/layout";
import { Text } from "@chakra-ui/react";
import { Button } from "@chakra-ui/button";
import { useHistory } from "react-router-dom";
import useToast from "../../hooks/useToast";
import config from "../../config";
import { useDispatch } from "react-redux";
import { LOGIN } from "../../redux/actions/authActions";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export default function PaymentSuccess({ location }) {
  const history = useHistory();
  const toast = useToast();
  const dispatch = useDispatch();
  const { course, subMessage, button } = location.state;
  const { t } = useTranslation();

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
        history.push(button.url);
      } else {
        toast({ status: "error", description: body.msg });
      }
    } catch (err) {
      toast({ status: "error", description: err.message });
    }
  }

  if (location?.state?.showOptions) {
    return (
      <Flex direction={"column"} w={"full"} h="full" justify={"center"} align="center">
        <Heading mb={3} color="primary">
          {t("options_header")} "{course.name}"
        </Heading>
        <Text mb={5} color="GrayText">
          {t("options_text")}
        </Text>
        <SimpleGrid gap={5} columns={[1, 1, 2, 2]}>
          <Button
            colorScheme={"secondary"}
            color="black"
            to={`/dashboard/quiz/${course._id}`}
            as={Link}
          >
            {t("options_btn1_text")}
          </Button>
          <Button
            colorScheme={"secondary"}
            color="black"
            to={`/dashboard/alcs/${course._id}`}
            as={Link}
          >
            {t("options_btn2_text")}
          </Button>
        </SimpleGrid>
      </Flex>
    );
  } else {
    return (
      <Flex w="full" h="full" justify="center" align="center" direction="column">
        <Heading mb={3} fontSize="2xl" fontWeight="normal" textAlign="center">
          {t("payment_success_message")} "{course.name}"{" "}
        </Heading>
        <Text mb={5}>{t(subMessage)}</Text>
        <Button onClick={startLearning} colorScheme="secondary" color="black">
          {t(button.text)}
        </Button>
      </Flex>
    );
  }
}
