import { Flex, Heading } from "@chakra-ui/layout";
import { Spinner } from "@chakra-ui/spinner";
import { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import config from "../../config";
import useToast from "../../hooks/useToast";
import { useStripe, useElements } from "@stripe/react-stripe-js";
import { CardElement } from "@stripe/react-stripe-js";
import { Button } from "@chakra-ui/button";
import { Text, Badge } from "@chakra-ui/react";
import { useSelector } from "react-redux";

const Pay = ({ location }) => {
  const [course, setCourse] = useState();
  const [loading, setLoading] = useState(true);
  const [checkoutError, setCheckoutError] = useState();
  const [processing, setProcessing] = useState(false);

  const toast = useToast();
  const history = useHistory();
  const { courseId } = useParams();
  const { user } = useSelector((state) => state.authReducer);

  const stripe = useStripe();
  const elements = useElements();

  // for fetching the course information
  async function fetchCourseData(abortController) {
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
        setLoading(false);
        document.title = `${config.appName} - Purchase ${body.course.name}`;
        if (body.courseExists) {
          toast({
            title: "Attention",
            status: "info",
            duration: 60000,
            description:
              "The course you are going to purchase, already exists in your account. Are you going to re-purchase it?",
          });
        }
      } else if (res.status === 404) {
        history.replace("/dashboard");
      } else {
        toast({
          status: "error",
          description: body.msg || "We are having unexpected server side issues",
        });
      }
    } catch (err) {
      toast({
        status: "error",
        description: err.message || "We are having unexpected client side issues",
      });
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setProcessing(true);

    const cardElement = elements.getElement("card");

    try {
      const res = await fetch(`${config.serverURL}/get_courses/purchaseCourse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          amount: course.price * 100,
          courseId,
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
            type: "course",
            checking: location.state ? location.state.fromCheckingPhase : false,
          });
          toast({
            status: "success",
            title: "Congratulations",
            description: "The course was purchased successfully",
          });
        }
      }
    } catch (err) {
      setCheckoutError(err.message);
      setProcessing(false);
    }
  }

  useEffect(() => {
    const abortController = new AbortController();
    fetchCourseData(abortController);
    return () => abortController.abort();
  }, []);

  if (!course && loading) {
    return (
      <Flex w="full" h="full" justify="center" align="center">
        <Spinner />
      </Flex>
    );
  }

  return (
    <Flex direction="column" w="full" h="full" align="center" justify="center">
      <Flex
        as="form"
        onSubmit={handleSubmit}
        w="100%"
        maxW="500px"
        direction="column"
        boxShadow="lg"
        p={10}
        rounded={5}
      >
        <Flex mb={10} direction="column">
          <Heading fontSize="3xl" mb={3} fontWeight="normal" textAlign="center" color="primary">
            {course.name}
          </Heading>
          <Text textAlign="center">Your Purchase for "{course.name}"</Text>
        </Flex>
        <CardElement
          onChange={(e) => (e.error ? setCheckoutError(e.error.message) : setCheckoutError())}
        />
        <Button
          disabled={!stripe || processing}
          type="submit"
          whiteSpace="wrap"
          colorScheme="secondary"
          color="black"
          mt={5}
          p="auto"
        >
          {processing ? "Processing..." : `Purchase by paying (${course.price}$)`}
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
};

export default Pay;
