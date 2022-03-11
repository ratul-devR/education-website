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

export default function BuyPackage() {
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
  // for fetching course info
  async function fetchCourseInfo(abortController) {
    try {
      const res = await fetch(`${config.serverURL}/get_courses/course/${courseId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        signal: abortController.signal,
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
          amount: course.price * 100,
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
            subMessage: "Now you can start learning these words",
            button: {
              text: "Start Learning",
              url: `/dashboard/alcs/${course._id}`,
            },
          });
        }
        toast({
          status: "success",
          title: "Success",
          description: "Your purchase of the package has been succeeded",
        });
      }
    } catch (err) {
      setCheckoutError(err.message);
      setProcessing(false);
    }
  }
  useEffect(() => {
    const abortController = new AbortController();
    fetchCourseInfo(abortController);
    return () => {
      abortController.abort();
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
    <Flex w="full" h="full" justify="center" align="center">
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
        <Text mb={10}>
          Hey, you completed the checking phase. Now the words and expressions you did not know are
          stored in your personal data base. <br /><br />
          There are {unknownQuestionsPack.length} words and expressions.<br /><br />
          These are the ones you still need to learn! Buy your personal package to make sure you know everything in this learning field!
        </Text>
        <CardElement
          onChange={(e) => (e.error ? setCheckoutError(e.error.message) : setCheckoutError())}
        />
        <Button
          type="submit"
          disabled={!stripe || processing}
          mt={5}
          colorScheme="secondary"
          color="black"
        >
          {processing ? "Processing..." : `Purchase By Paying (${course.price}$)`}
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
