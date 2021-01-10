// 
// message.js - wrapper for messaging api
//
import * as messaging from "messaging";
import * as senseHeartClock from "../senseHeartClock.js"

var timestampText = "xx:yy"

export function openMessaging(timestampText, heartRateText) {
  messaging.peerSocket.addEventListener("open", (evt) => {
    console.log("App - Ready to send or receive messages");
    sendMessage(timestampText, heartRateText);
  });

  messaging.peerSocket.addEventListener("error", (err) => {
    console.error(`App - Connection error: ${err.code} - ${err.message}`);
  });
}


function sendMessage(timestampText, heartRateText) {
  // timestampText = senseHeartClock.getCurrentTimeLabel()
  // Sample data
  const data = {
    title: 'Heart Rate Metrics',
    isTest: true,
    timestamp: timestampText,
    records: [1, 2, 3, 4],
    heartRate: heartRateText
    // heartRate: senseHeartClock.getHeartRate(),
    // timestamp: timestampText
  }

  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    // Send the data to peer as a message
    messaging.peerSocket.send(data);
    var dataText = JSON.stringify(data);
    console.log(`App - sending: ${dataText}`);
  }
}
