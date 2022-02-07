import config from "../config";
import useToast from "./useToast";
import { useDispatch } from "react-redux";
import { FETCH_AND_UPDATE_SETTINGS } from "../redux/actions/settingsActions";
import i18n from "i18next";

export default function useSettings() {
  const toast = useToast();
  const dispatch = useDispatch();

  async function getSettings(abortController) {
    try {
      const res = await fetch(`${config.serverURL}/get_settings`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        signal: abortController && abortController.signal,
      });
      const body = await res.json();
      if (res.ok) {
        dispatch(FETCH_AND_UPDATE_SETTINGS(body.settings));
        if (body.settings.lang) {
          i18n.changeLanguage(body.settings.lang);
        }
      } else if (res.status !== 404 && !res.ok) {
        toast({ status: "error", description: body.msg });
      }
    } catch (err) {
      toast({ status: "error", description: err.message });
    }
  }

  return getSettings;
}
