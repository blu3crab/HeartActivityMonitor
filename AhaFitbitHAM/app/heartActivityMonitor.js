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
import { me as appbit} from "appbit";
import { BodyPresenceSensor } from "body-presence";

// Get a handle on the <text> element
const currentTimeLabel = document.getElementById("currentTimeLabel");
const heartRateLabel = document.getElementById("heartRateLabel");
const hrm = new HeartRateSensor({ frequency: 1 });

const BATCH_RELAY_MAX = 8;
//const HRM_BATCH_SIZE = 60;
const HRM_BATCH_SIZE = 8;
const NADA_TIMESTAMP = "xx:yy";
let batchRelayCount = 0;
let hrmBatchTimestamp = NADA_TIMESTAMP;
let hrmCount = 0;
let hrmBatch = new Array(HRM_BATCH_SIZE);

export function getCurrentTimeLabel() {
  return currentTimeLabel.text
}
export function getHeartRate() {
  return hrm.heartRate
}
export function start() {
  // set app to not timeout due to inactivity
  appbit.appTimeoutEnabled = false;
  //console.log(`App - id: ${me.Appbit.applicationId} with timeoutEnabled = ${me.appTimeoutEnabled}`);
  // Update the clock every minute
  clock.granularity = "minutes";
  
  console.log(`App - message.openMessaging invoked...`);
  message.openMessaging()

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
      //hrmBatchTimestamp = currentTimeLabel.text;
      let secs = util.zeroPad(today.getSeconds());
      hrmBatchTimestamp = `${hours}:${mins}:${secs}`;
      console.log(`App - setting batch timestamp: ${hrmBatchTimestamp}`);
    }
      // TODO: initial load or resuming after presense off-wrist condition
      // if ()
      //   // send reset signal
      //   hrmBatch[hrmCount] = "--";
      //   // send batch
      //   console.log(`App - Open messaging: ${hrmBatchTimestamp} - ${hrmBatch}`);
      //   message.openMessaging(hrmBatchTimestamp, hrmBatch)
      // }
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
      
      // if batches relays is less than allowed max messages
      if (batchRelayCount < BATCH_RELAY_MAX) {
        console.log(`App - hrm batch size: ${hrmCount}`);
        // TODO: if assigning 0, set time
        // add metric to batch
        hrmBatch[hrmCount++] = hrm.heartRate;
        if (hrmCount >= HRM_BATCH_SIZE) {
          // send batch
          console.log(`App - Open messaging: ${hrmBatchTimestamp} - ${hrmBatch}`);
          message.sendMessage(hrmBatchTimestamp, hrmBatch)
          // clear batch
          hrmBatchTimestamp = NADA_TIMESTAMP;
          hrmCount = 0;
          // bump relay count
          ++batchRelayCount;
          console.log(`App - resetting batch timestamp: ${hrmBatchTimestamp} after batch ${batchRelayCount}`);
        }
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