//
// heartActivityMonitor.js - monitor heart rate at 1 sec intervals with clock at 60 sec interval
//
import clock from "clock";
import document from "document";
import { preferences } from "user-settings";
import * as util from "./util/format.js";
import * as message from "./util/message.js";

import { HeartRateSensor } from "heart-rate";
import { display } from "display";
import { me as appbit } from "appbit";
import { BodyPresenceSensor } from "body-presence";

// Get a handle on the <text> element
const currentTimeLabel = document.getElementById("currentTimeLabel");
const heartRateLabel = document.getElementById("heartRateLabel");
const hrm = new HeartRateSensor({ frequency: 1 });

export function getCurrentTimeLabel() {
  return currentTimeLabel.text
}
export function getHeartRate() {
  return hrm.heartRate
}
export function start() {
  // Update the clock every minute
  clock.granularity = "minutes";

  // Update the currentTime <text> element every tick with the current time
  clock.ontick = (evt) => {
    let today = evt.date;
    let hours = today.getHours();
    if (preferences.clockDisplay === "12h") {
      // 12h format
      hours = hours % 12 || 12;
    } else {
      // 24h format
      hours = util.zeroPad(hours);
    }
    let mins = util.zeroPad(today.getMinutes());
    currentTimeLabel.text = `${hours}:${mins}`;
  }
  if (BodyPresenceSensor) {
    const body = new BodyPresenceSensor();
    body.addEventListener("reading", () => {
      if (!body.present) {
        hrm.stop();
        heartRateLabel.text = "--"
      } else {
        hrm.start();
        heartRateLabel.text = hrm.heartRate
      }
    });
    body.start();
  }
  // update heart rate
  if (HeartRateSensor && appbit.permissions.granted("access_heart_rate")) {
    hrm.addEventListener("reading", () => {
      console.log(`Current heart rate: ${hrm.heartRate}`);
      heartRateLabel.text = hrm.heartRate
      console.log(`Open messaging: ${currentTimeLabel.text} - ${hrm.heartRate}`);
      message.openMessaging(currentTimeLabel.text, hrm.heartRate)
    });

    display.addEventListener("change", () => {
      // stop the sensor when the screen is off to conserve battery
      display.on ? hrm.start() : hrm.stop();
    });
  }
  else if (!appbit.permissions.granted("access_heart_rate")) {
    // show permission not granted
    heartRateLabel.text = "XX"
  }
  else {
    // show heart sensor not available
    heartRateLabel.text = "..."
  }
}