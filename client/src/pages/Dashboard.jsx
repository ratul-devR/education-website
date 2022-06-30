import { useEffect } from "react";
import { Switch, Route, useRouteMatch } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { useSelector } from "react-redux";
import { Flex, Heading, Button, Text } from "@chakra-ui/react";

import config from "../config";

import Layout from "../layouts/Dashboard";

// pages
import Courses from "../components/Dashboard/Courses";
import Quiz from "../components/Dashboard/Quiz/";
import Pay from "../components/Dashboard/Pay";
import Learn from "../components/Dashboard/Learn";
import Alc from "../components/Dashboard/Alc";
import PaymentSuccess from "../components/Dashboard/PaymentSuccess";
import BuyPackage from "../components/Dashboard/BuyPackage";
import AllAlcItems from "../components/Dashboard/AllAlcItems";
import Package from "../components/Dashboard/Package";
import FrontPage from "../components/Dashboard/FrontPage";

import useLogout from "../hooks/useLogout";

const stripePromise = loadStripe(import.meta.env.VITE_APP_STRIPE_PUBLISHABLE_KEY);

const Dashboard = () => {
  const { user } = useSelector((state) => state.authReducer);
  const { path } = useRouteMatch();
  const logout = useLogout();

  useEffect(() => {
    document.title = `${config.appName} - Dashboard`;
  }, []);

  if (!user.verified) {
    return (
      <Flex w="full" h="100vh" justify="center" align="center" direction="column">
        <Heading fontSize="2xl" color="red.400" mb={3}>
          Sign Up
        </Heading>
        <Heading w="full" maxW="450px" fontSize="md" textAlign="center" fontWeight="normal" mb={3}>
          Please check your emails to confirm your registration. If you do not find an email from us
          please look into your spam.
        </Heading>
        <Heading mb={3} fontSize="md" color="GrayText" fontWeight="normal">
          {user.email}
        </Heading>
      </Flex>
    );
  } else if (user.loginRequired) {
    return (
      <Flex direction="column" w="full" h="100vh" justify="center" align="center">
        <Heading fontSize={50} mb={3}>
          Login Required
        </Heading>
        <Text color="GrayText" mb={3}>
          Please login again to continue
        </Text>
        <Button colorScheme="secondary" color="black" onClick={logout}>
          Logout
        </Button>
      </Flex>
    );
  } else {
    return (
      <Layout>
        <Elements stripe={stripePromise}>
          <Switch>
            <Route path={path} exact component={Learn} />
            <Route path={`${path}/quiz`} exact>
              <Courses title="checking_phase" path="product" />
            </Route>
            <Route path={`${path}/activation_phase`} exact>
              <Courses title="activation_phase" path="activation_phase" />
            </Route>

            <Route path={`${path}/product/:productId`} exact component={FrontPage} />

            <Route path={`${path}/alc/:alcId/:courseId`} component={Alc} />
            <Route path={`${path}/alc`}>
              <Courses title="alc_plc" path="alcs" />
            </Route>
            <Route path={`${path}/alcs/:courseId`} component={AllAlcItems} />

            {/* "getUserQuestionsOfCourse" is the path for checking phase */}
            <Route path={`${path}/quiz/:courseId`}>
              <Quiz path={"getUserQuestionsOfCourse"} />
            </Route>
            {/* "getUserUnknownQuestions" is the path for activation/learning phase */}
            <Route path={`${path}/activation_phase/:courseId`}>
              <Quiz path={"getUserUnknownQuestions"} />
            </Route>
            <Route path={`${path}/package/:packageId`} component={Package} />
            <Route path={`${path}/pay/:courseId/`} component={Pay} />
            <Route path={`${path}/buyPackage/:courseId`} component={BuyPackage} />
            <Route path={`${path}/paymentSuccess`} component={PaymentSuccess} />
          </Switch>
        </Elements>
      </Layout>
    );
  }
};

export default Dashboard;
