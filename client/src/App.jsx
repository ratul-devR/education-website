import { BrowserRouter, Switch, Route, Redirect } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { Flex } from "@chakra-ui/layout";
import { Spinner } from "@chakra-ui/spinner";

import useToast from "./hooks/useToast";

import config from "./config";

// actions
import { LOGIN, LOGOUT, ORG_LOGIN } from "./redux/actions/authActions";

// components
import ProtectedRoute from "./components/global/ProtectedRoute";
import AdminRoute from "./components/global/AdminRoute";
import OrgProtectedRoute from "./components/global/OrgProtectedRoute";

// pages
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import Registration from "./pages/Registration";
import OrgDashboard from "./pages/OrgDashboard";

const App = () => {
  const [pending, setPending] = useState(true);
  const dispatch = useDispatch();
  const toast = useToast();

  // for checking if the user is authenticated or not
  async function checkAuthStatus(abortController) {
    try {
      const res = await fetch(`${config.serverURL}/get_auth/checkLogin`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        signal: abortController.signal,
      });
      const body = await res.json();

      if (res.status) {
        setPending(false);
      }

      if (res.ok) {
        // if there is a affiliateLink property that means it's an org object
        if (body.affiliateLink) {
          dispatch(ORG_LOGIN(body));
        } else {
          dispatch(LOGIN(body));
        }
      } else {
        dispatch(LOGOUT());
      }
    } catch (err) {
      dispatch(LOGOUT());
      toast({ status: "error", description: err.message });
    }
  }

  useEffect(() => {
    const abortController = new AbortController();

    checkAuthStatus(abortController);

    localStorage.setItem("chakra-ui-color-mode", JSON.stringify("light"));

    return () => abortController.abort();
  }, []);

  // if the server response is pending this spinner should be shown
  if (pending) {
    return (
      <Flex h="100vh" justify="center" align="center">
        <Spinner colorScheme="primary" />
      </Flex>
    );
  }

  return (
    <BrowserRouter>
      <Switch>
        <ProtectedRoute path="/dashboard" component={Dashboard} />
        <OrgProtectedRoute path="/orgDashboard" component={OrgDashboard} />
        <AdminRoute path="/admin" component={Admin} />
        <Route path="/auth" component={Registration} />
        <Redirect path="*" to="/auth" />
      </Switch>
    </BrowserRouter>
  );
};

export default App;
