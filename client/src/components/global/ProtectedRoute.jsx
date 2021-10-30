import { Route, Redirect } from "react-router-dom";

const ProtectedRoute = ({ component: Component, ...rest }) => {
  const user = JSON.parse(localStorage.getItem("user")) || {};

  return (
    <Route
      {...rest}
      render={(props) => {
        return user._id ? (
          <Component {...props} user={user} />
        ) : (
          <Redirect to={{ pathname: "/login" }} />
        );
      }}
    />
  );
};

export default ProtectedRoute;
