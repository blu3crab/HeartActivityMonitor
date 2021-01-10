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

const HRM_BATCH_SIZE = 2;
const NADA_TIMESTAMP = "xx:yy";
var hrmBatchTimestamp = NADA_TIMESTAMP;
var hrmCount = 0;
var hrmBatch = new Array(HRM_BATCH_SIZE);

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
    
    if (hrmBatchTimestamp == NADA_TIMESTAMP) {
      hrmBatchTimestamp = currentTimeLabel.text;
      console.log(`App - setting batch timestamp: ${hrmBatchTimestamp}`);
      // TODO: initial load or resuming after presense off-wrist condition
      // if ()
      //   // send reset signal
      //   hrmBatch[hrmCount] = "--";
      //   // send batch
      //   console.log(`App - Open messaging: ${hrmBatchTimestamp} - ${hrmBatch}`);
      //   message.openMessaging(hrmBatchTimestamp, hrmBatch)
      // }
    }
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
      console.log(`App - Current heart rate: ${hrm.heartRate}`);
      heartRateLabel.text = hrm.heartRate
      
      // add metric to batch
      hrmBatch[hrmCount++] = hrm.heartRate;
      if (hrmCount >= HRM_BATCH_SIZE) {
        // send batch
        console.log(`App - Open messaging: ${hrmBatchTimestamp} - ${hrmBatch}`);
        message.openMessaging(hrmBatchTimestamp, hrmBatch)
        // clear batch
        hrmBatchTimestamp = NADA_TIMESTAMP;
        hrmCount = 0;
      }
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