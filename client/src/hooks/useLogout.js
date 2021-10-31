import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";

import config from "../config";
import useToast from "./useToast";
import { LOGOUT } from "../redux/actions/authActions";

const useLogout = () => {
  const toast = useToast();
  const dispatch = useDispatch();
  const history = useHistory();

  async function logout() {
    try {
      const res = await fetch(`${config.serverURL}/get_auth/logout`, {
        method: "GET",
        credentials: "include",
      });
      const body = await res.json();

      if (res.ok) {
        dispatch(LOGOUT());
        toast({ status: "success", description: body.msg });
        history.push("/auth");
      } else {
        toast({
          status: "error",
          description: body.msg || "We are having some server side errors",
        });
      }
    } catch (err) {
      toast({
        status: "error",
        description: err.message || "We are having some unexpected errors",
      });
    }
  }

  return logout;
};

export default useLogout;
