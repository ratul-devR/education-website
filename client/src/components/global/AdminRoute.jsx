import { Route, Redirect } from "react-router-dom";

const ProtectedRoute = ({ component: Component, ...rest }) => {
  const user = JSON.parse(localStorage.getItem("user")) || {};

  return (
    // if the user is authenticated and if the not admin, he will be redirected to the dashboard
    // else if the user is not authenticated, he will be redirected to the login page
    <Route
      {...rest}
      render={(props) => {
        return user._id ? (
          user.role === "admin" ? (
            <Component {...props} user={user} />
          ) : (
            <Redirect to={{ pathname: "/dashboard" }} />
          )
        ) : (
          <Redirect to={{ pathname: "/login" }} />
        );
      }}
    />
  );
};

export default ProtectedRoute;
