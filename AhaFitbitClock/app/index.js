/*
 * Entry point for the watch app
 */
import document from "document";

import * as messaging from "messaging";

import {viewHeartClock} from "./viewHeartClock.js"
import {getHeartRate} from "./viewHeartClock.js"
import {getCurrentTimeLabel} from "./viewHeartClock.js"
var timestampText = "xx:yy"
// show heart clock
viewHeartClock()

// 
messaging.peerSocket.addEventListener("open", (evt) => {
  console.log("App - Ready to send or receive messages");
  sendMessage();
});

messaging.peerSocket.addEventListener("error", (err) => {
  console.error(`App - Connection error: ${err.code} - ${err.message}`);
});

let demotext = document.getElementById("demotext");
demotext.text = "Fitbit Studio rocks!";

function sendMessage() {
  timestampText = getCurrentTimeLabel()
  // Sample data
  const data = {
    title: 'My test data',
    isTest: true,
    records: [1, 2, 3, 4],
    heartRate: getHeartRate(),
    timestamp: timestampText
  }

  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    // Send the data to peer as a message
    messaging.peerSocket.send(data);
  }
}