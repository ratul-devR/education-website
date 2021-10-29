import { BrowserRouter, Switch, Route, Redirect } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { Flex } from "@chakra-ui/layout";
import { Spinner } from "@chakra-ui/spinner";

import config from "./config";

// actions
import { LOGIN, LOGOUT } from "./redux/actions/authActions";

// components
import ProtectedRoute from "./components/global/ProtectedRoute";
import AdminRoute from "./components/global/AdminRoute";

// pages
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import Registration from "./pages/Registration";

const App = () => {
  const [pending, setPending] = useState(true);
  const dispatch = useDispatch();

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

      if (!!res.status) {
        setPending(false);
      }

      if (res.ok) {
        dispatch(LOGIN(body));
      } else {
        dispatch(LOGOUT());
      }
    } catch (err) {
      dispatch(LOGOUT());
    }
  }

  useEffect(() => {
    const abortController = new AbortController();

    checkAuthStatus(abortController);

    return () => abortController.abort();
  }, []);

  // if the server response is pending this spinner should be shown
  if (pending) {
    return (
      <Flex h="100vh" justify="center" align="center">
        <Spinner colorScheme="teal" />
      </Flex>
    );
  } else {
    return (
      <BrowserRouter>
        <Switch>
          <ProtectedRoute exact path="/dashboard" component={Dashboard} />
          <AdminRoute path="/admin" component={Admin} />
          <Route path="/auth" component={Registration} />
          <Redirect path="*" to="/auth" />
        </Switch>
      </BrowserRouter>
    );
  }
};

export default App;
