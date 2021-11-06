import { useEffect } from "react";
import { Switch, Route, useRouteMatch } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js"
import { Elements } from "@stripe/react-stripe-js"

import config from "../config";

import Layout from "../layouts/Dashboard";

// pages
import UserCourses from "../components/Dashboard/UserCourses";
import Courses from "../components/Dashboard/Courses";
import Quiz from "../components/Dashboard/Quiz/";
import Pay from "../components/Dashboard/Pay";

const stripePromise = loadStripe(import.meta.env.VITE_APP_STRIPE_PUBLISHABLE_KEY);

const Dashboard = () => {
  const { path } = useRouteMatch();

  useEffect(() => {
    document.title = `${config.appName} - Dashboard`;
  }, []);

  return (
    <Layout>
      <Elements stripe={stripePromise}>
      <Switch>
        <Route path={path} exact component={UserCourses} />
        <Route path={`${path}/courses`} component={Courses} />
        <Route path={`${path}/quiz/:courseId`} component={Quiz} />
        <Route path={`${path}/pay/:courseId/`} component={Pay} />
      </Switch>
      </Elements>
    </Layout>
  );
};

export default Dashboard;
