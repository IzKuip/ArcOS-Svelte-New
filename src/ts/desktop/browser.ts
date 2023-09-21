import firefox from "../../assets/firefox.png";
import { makeNotification } from "../notiflogic/main";

export function checkFirefox() {
  const isFirefox = navigator.userAgent.toLowerCase().includes("firefox");

  if (!isFirefox) return;

  makeNotification({
    image: firefox,
    title: "Firefox unsupported",
    message:
      "We don't officially support Firefox due to lacking CSS compatibility. Some visual elements of ArcOS have been disabled. We recommend using a chromium-based browser for running ArcOS.",
    buttons: [],
  });
}