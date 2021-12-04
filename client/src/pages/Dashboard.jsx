import { useEffect } from "react";
import { Switch, Route, useRouteMatch } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { useSelector } from "react-redux";
import { Flex, Heading, Button } from "@chakra-ui/react";

import config from "../config";

import Layout from "../layouts/Dashboard";

// pages
import UserCourses from "../components/Dashboard/UserCourses";
// import Courses from "../components/Dashboard/Courses";
import ActivationPhrase from "../components/Dashboard/ActivationPhrase";
import Quiz from "../components/Dashboard/Quiz/";
import Pay from "../components/Dashboard/Pay";
import Learn from "../components/Dashboard/Learn";
import Alc from "../components/Dashboard/Alc";
import PaymentSuccess from "../components/Dashboard/PaymentSuccess";
import BuyPackage from "../components/Dashboard/BuyPackage"

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
          You are not verified
        </Heading>
        <Heading fontSize="md" textAlign="center" fontWeight="normal" mb={3}>
          Please check you mail inbox
        </Heading>
        <Heading mb={3} fontSize="md" color="GrayText" fontWeight="normal">
          {user.email}
        </Heading>
        <Button colorScheme="blue" onClick={logout}>
          Log into another account
        </Button>
      </Flex>
    );
  }

  return (
    <Layout>
      <Elements stripe={stripePromise}>
        <Switch>
          <Route path={path} exact component={Learn} />
          <Route path={`${path}/quiz`} exact component={UserCourses} />
          <Route path={`${path}/activation_phase`} exact component={ActivationPhrase} />
          {/* <Route path={`${path}/courses`} component={Courses} /> */}
          <Route path={`${path}/alc/:courseId`} component={Alc} />
          {/* "getUserQuestionsOfCourse" is the path for checking phase */}
          <Route path={`${path}/quiz/:courseId`}>
            <Quiz path={"getUserQuestionsOfCourse"} />
          </Route>
          {/* "getUserUnknownQuestions" is the path for activation/learning phase */}
          <Route path={`${path}/activation_phase/:courseId`}>
            <Quiz path={"getUserUnknownQuestions"} />
          </Route>
          <Route path={`${path}/pay/:courseId/`} component={Pay} />
          <Route path={`${path}/buyPackage/:courseId`} component={BuyPackage} />
          <Route path={`${path}/paymentSuccess`} component={PaymentSuccess} />
        </Switch>
      </Elements>
    </Layout>
  );
};

export default Dashboard;
