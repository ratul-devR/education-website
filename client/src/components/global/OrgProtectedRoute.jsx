import { Route, Redirect } from "react-router-dom";

export default function OrgProtectedRoute({ component: Component, ...rest }) {
  const org = JSON.parse(localStorage.getItem("org")) || null;
  return (
    <Route
      {...rest}
      render={(props) => {
        return org ? <Component {...props} /> : <Redirect to={{ pathname: "/auth/loginOrg" }} />;
      }}
    />
  );
}
