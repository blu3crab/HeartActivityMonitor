///////////////////////////////////////////////////////////////////////////////
// heartActivityMonitor.js by  M.A.Tucker 01JAN2021
// - monitor heart rate at 1 sec intervals
// - update clock at 60 sec interval
// - upload HR batch message at HRM_BATCH_SIZE metrics per message
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

///////////////////////////////////////////////////////////////////////////////
// <text> element handles
const currentTimeLabel = document.getElementById("currentTimeLabel");
const heartRateLabel = document.getElementById("heartRateLabel");
// HeartRateSensor object with 1 sec updates
const hrm = new HeartRateSensor({ frequency: 1 });

// terminate sending batches when MAX reached
// const BATCH_RELAY_MAX = 8;
const BATCH_RELAY_MAX = 99999;

// upload HRM_BATCH_SIZE HR metrics message
// const HRM_BATCH_SIZE = 60;
const HRM_BATCH_SIZE = 8;

// default message fields
const NADA_TIMESTAMP = "xx:yy";
const OFF_BODY_HR_INDICATOR = "---"
const OFF_BODY_HR_VALUE = 0
// hrm messaging
let batchRelayCount = 0;
let hrmBatchTimestamp = NADA_TIMESTAMP;
let hrmCount = 0;
let hrmBatch = new Array(HRM_BATCH_SIZE);

let doNotAppendSecs = false;
let appendSecs = true;
let onbody = false;


///////////////////////////////////////////////////////////////////////////////
function resetHrmBatch() {
  for (var i = 0; i < HRM_BATCH_SIZE; i++) hrmBatch[i] = OFF_BODY_HR_VALUE;
}
function getCurrentTimeLabel(appendSecs) {
    let today = new Date();
    let hours = today.getHours();
    if (preferences.clockDisplay === "12h") {
      // 12h format
      hours = hours % 12 || 12;
    } else {
      // 24h format
      hours = util.zeroPad(hours);
    }
    let mins = util.zeroPad(today.getMinutes());
    let secs = util.zeroPad(today.getSeconds());
    if (appendSecs) {
      console.log(`App - getCurrentTimeLabel ${hours}:${mins}:${secs}`);
      return `${hours}:${mins}:${secs}`;
    }
    console.log(`App - getCurrentTimeLabel ${hours}:${mins}`);
    return `${hours}:${mins}`;
}
// export function getCurrentTimeLabel() {
//   return currentTimeLabel.text
// }
// export function getHeartRate() {
//   return hrm.heartRate
// }
export function start() {
  // set app to not timeout due to inactivity
  appbit.appTimeoutEnabled = false;
  //console.log(`App - id: ${me.Appbit.applicationId} with timeoutEnabled = ${me.appTimeoutEnabled}`);
  // update the clock every minute
  clock.granularity = "minutes";
  // reset hrm batch
  resetHrmBatch();
  
  console.log(`App - message.openMessaging invoked...`);
  message.openMessaging()

  // Update the currentTime <text> element every tick with the current time
  clock.ontick = (evt) => {
    // let today = evt.date;
    // let hours = today.getHours();
    // if (preferences.clockDisplay === "12h") {
    //   // 12h format
    //   hours = hours % 12 || 12;
    // } else {
    //   // 24h format
    //   hours = util.zeroPad(hours);
    // }
    // let mins = util.zeroPad(today.getMinutes());
    // let secs = util.zeroPad(today.getSeconds());
    // currentTimeLabel.text = `${hours}:${mins}`;
    
    // set timestamp on clock tick
    currentTimeLabel.text = getCurrentTimeLabel(doNotAppendSecs);
    hrmBatchTimestamp = getCurrentTimeLabel();
    console.log(`App - setting batch timestamp: ${hrmBatchTimestamp}`);
  }
  // BodyPresenceSensor detects on/off body condition
  if (BodyPresenceSensor) {
    const body = new BodyPresenceSensor();
    body.addEventListener("reading", () => {
      if (!body.present) {  // if NOT on-body
        onbody = false;
        // stop HR monitor
        hrm.stop();
        // append off-body indicator to HR batch
        hrmBatch[hrmCount++] = OFF_BODY_HR_VALUE
        heartRateLabel.text = OFF_BODY_HR_INDICATOR
        // clear batch index
        hrmCount = 0;
        // bump relay count
        ++batchRelayCount;
        // get current timestamp
        hrmBatchTimestamp = getCurrentTimeLabel(appendSecs);
        // send message
        console.log(`App - sendMessage: ${hrmBatchTimestamp} - ${hrmBatch}`);
        message.sendMessage(hrmBatchTimestamp, hrmBatch);
        // reset batch after send
        resetHrmBatch();
      } else {  // if IS on-body
        onbody = true;
        // append off-body indicator to HR batch
        hrmBatch[hrmCount++] = OFF_BODY_HR_VALUE;
        heartRateLabel.text = OFF_BODY_HR_INDICATOR;
        // start HR monitor
        hrm.start();
        //heartRateLabel.text = hrm.heartRate
      }
    });
    body.start();
  }
  // update heart rate
  if (HeartRateSensor && appbit.permissions.granted("access_heart_rate")) {
    hrm.addEventListener("reading", () => {
      if (onbody) {
        // show HR reading
        console.log(`App - Current heart rate: ${hrm.heartRate}`);
        heartRateLabel.text = hrm.heartRate;

        // if batch relay count is less than allowed max messages
        if (batchRelayCount < BATCH_RELAY_MAX) {
          console.log(`App - hrm batch size: ${hrmCount}`);
          // TODO: if assigning 0, set time

          // add metric to batch
          hrmBatch[hrmCount++] = hrm.heartRate;
          if (hrmCount >= HRM_BATCH_SIZE) {
            // get current timestamp
            hrmBatchTimestamp = getCurrentTimeLabel(appendSecs);
            // send batch
            console.log(`App - sendMessage: ${hrmBatchTimestamp} - ${hrmBatch}`);
            message.sendMessage(hrmBatchTimestamp, hrmBatch);
            // reset batch after send
            resetHrmBatch();
            // clear batch
            //hrmBatchTimestamp = NADA_TIMESTAMP;
            hrmCount = 0;
            // bump relay count
            ++batchRelayCount;
            console.log(`App - sending batch timestamp: ${hrmBatchTimestamp} after batch ${batchRelayCount}`);
          }
        }
      }
      else {
        console.log(`App - NOT sending batch-> batchRelayCount(${batchRelayCount}) !< BATCH_RELAY_MAX(${BATCH_RELAY_MAX})`);
      }
    });

    // display.addEventListener("change", () => {
    //   // stop the sensor when the screen is off to conserve battery
    //   display.on ? hrm.start() : hrm.stop();
    // });
    if (display.aodAllowed && display.aodActive) {
      console.log(`App - AOD allowed/active`);
    }
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