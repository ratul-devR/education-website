import { Route, Redirect } from "react-router-dom";

const ProtectedRoute = ({ component: Component, ...rest }) => {
  const user = JSON.parse(localStorage.getItem("user")) || {};

  return (
    <Route
      {...rest}
      render={(props) => {
        return user._id ? (
          <Component {...props} />
        ) : (
          <Redirect to={{ pathname: "/login", state: { from: props.location } }} />
        );
      }}
    />
  );
};

export default ProtectedRoute;
