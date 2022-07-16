import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RESET_QUIZ } from "../../redux/actions/quizActions";
import { Flex, Heading, Text } from "@chakra-ui/layout";
import { Spinner } from "@chakra-ui/spinner";
import { useEffect, useState } from "react";
import config from "../../config";
import { useHistory } from "react-router-dom";
import useToast from "../../hooks/useToast";
import { CardElement } from "@stripe/react-stripe-js";
import { useStripe, useElements } from "@stripe/react-stripe-js";
import { Button } from "@chakra-ui/button";
import { Badge } from "@chakra-ui/react";
import { useTranslation } from "react-i18next";

export default function BuyPackage({ location }) {
  const [course, setCourse] = useState();
  const [unknownQuestionsPack, setUnknownQuestionsPack] = useState([]);
  const [checkoutError, setCheckoutError] = useState();
  const [processing, setProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const { courseId } = useParams();
  const { user } = useSelector((state) => state.authReducer);
  const dispatch = useDispatch();
  const history = useHistory();
  const toast = useToast();
  const stripe = useStripe();
  const elements = useElements();
  const { t } = useTranslation();
  // for fetching course info
  async function fetchCourseInfo() {
    try {
      const res = await fetch(`${config.serverURL}/get_courses/course/${courseId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const body = await res.json();
      if (res.ok) {
        setCourse(body.course);
        setUnknownQuestionsPack(body.unknownQuestionPack);
        setLoading(false);
      } else if (res.status === 404) {
        history.replace("/dashboard");
        toast({
          status: "warning",
          description: "Course Not Found! Stop navigating with invalid URL's!!",
        });
      } else {
        history.replace("/dashboard");
        toast({ status: "error", description: body.msg || "Server Side Error" });
      }
    } catch (err) {
      toast({ status: "error", description: err.message });
    }
  }
  // for handling the payment
  async function handleSubmit(e) {
    e.preventDefault();
    setProcessing(true);
    const cardElement = elements.getElement("card");
    try {
      const res = await fetch(`${config.serverURL}/get_courses/buyPackage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          amount: Math.round(course.price) * 100,
          courseId: course._id,
          userId: user._id,
        }),
      });
      const { client_secret } = await res.json();
      const paymentMethodReq = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
      });
      if (paymentMethodReq.error) {
        setCheckoutError(paymentMethodReq.error.message);
        setProcessing(false);
        return;
      }
      const result = await stripe.confirmCardPayment(client_secret, {
        payment_method: paymentMethodReq.paymentMethod.id,
      });
      if (result.error) {
        setCheckoutError(result.error.message);
        setProcessing(false);
        return;
      } else {
        if (result.paymentIntent.status === "succeeded") {
          setProcessing(false);
          history.push("/dashboard/paymentSuccess", {
            course,
            phase: "learning",
            showOptions: location?.state?.showOptions || null,
            subMessage: "payment_success_sub_message_learning",
            button: {
              text: "start",
              url: `/dashboard/alcs/${course._id}`,
            },
          });
        }
        toast({
          status: "success",
          title: t("payment_success_toast_message_title"),
          description: t("payment_success_toast_message_description"),
        });
      }
    } catch (err) {
      setCheckoutError(err.message);
      setProcessing(false);
    }
  }
  useEffect(() => {
    fetchCourseInfo();
    return () => {
      dispatch(RESET_QUIZ());
    };
  }, []);
  if (loading) {
    return (
      <Flex w="full" h="full" justify="center" align="center">
        <Spinner />
      </Flex>
    );
  }
  return (
    <Flex w="full" justify="center" align="center">
      <Flex
        as="form"
        onSubmit={handleSubmit}
        w="500px"
        direction="column"
        justify="center"
        p={10}
        rounded={5}
        boxShadow="lg"
      >
        <Heading textAlign="center" mb={3} fontWeight="normal" fontSize="2xl" color="primary">
          {course.name}
        </Heading>
        {course.lpPaymentMessage && (
          <Text whiteSpace="pre-wrap" mb={10}>
            {course.lpPaymentMessage &&
              course.lpPaymentMessage
                .replace(/{{number}}/g, unknownQuestionsPack.length)
                .replace(/{{product}}/g, course.name)}
          </Text>
        )}
        <CardElement
          onReady={(e) => e.focus()}
          onChange={(e) => (e.error ? setCheckoutError(e.error.message) : setCheckoutError())}
        />
        <Button
          type="submit"
          disabled={!stripe || processing}
          mt={5}
          colorScheme="secondary"
          color="black"
        >
          {processing ? "Processing..." : `${t("purchase_button")} ${course.displayPrice}€`}
        </Button>
        {checkoutError && (
          <Badge
            whiteSpace="wrap"
            textAlign="center"
            mt={5}
            colorScheme="red"
            variant="subtle"
            p={1}
            rounded={2}
          >
            {checkoutError}
          </Badge>
        )}
      </Flex>
    </Flex>
  );
}
