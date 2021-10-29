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

// pages
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

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
  }

  return (
    <BrowserRouter>
      <Switch>
        <ProtectedRoute path="/dashboard" component={Dashboard} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Redirect path="*" to="/login" />
      </Switch>
    </BrowserRouter>
  );
};

export default App;
