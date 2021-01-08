import clock from "clock";
import document from "document";
import { preferences } from "user-settings";
import * as util from "../common/utils";

import { HeartRateSensor } from "heart-rate";
import { display } from "display";
import { me as appbit } from "appbit";

// Update the clock every minute
clock.granularity = "minutes";

// Get a handle on the <text> element
const currentTimeLabel = document.getElementById("currentTimeLabel");
const heartRateLabel = document.getElementById("heartRateLabel");

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
  //heartRateLabel.text = "93"
}
// update the HR
if (HeartRateSensor && appbit.permissions.granted("access_heart_rate")) {
//if (HeartRateSensor) {
  //const hrm = new HeartRateSensor({ frequency: 1, batch: 2 });
  const hrm = new HeartRateSensor({ frequency: 1 });
  hrm.addEventListener("reading", () => {
    console.log(`Current heart rate: ${hrm.heartRate}`);
    heartRateLabel.text = hrm.heartRate
    // for (let index = 0; index < hrm.readings.timestamp.length; index++) {
    //   console.log(
    //     `HeartRateSensor Reading: \
    //       timestamp=${hrm.readings.timestamp[index]}, \
    //       [${hrm.readings.bpm[index]}]`
    //   );
    // }
  });
  
  display.addEventListener("change", () => {
    // Automatically stop the sensor when the screen is off to conserve battery
    display.on ? hrm.start() : hrm.stop();
  });

  hrm.start();
}