// 
// message.js - wrapper for messaging api
//
import * as messaging from "messaging";
import * as senseHeartClock from "../senseHeartClock.js"

var timestampText = "xx:yy"

export function openMessaging(timestampText, heartRateBatch) {
  messaging.peerSocket.addEventListener("open", (evt) => {
    console.log("App - Ready to send or receive messages");
    sendMessage(timestampText, heartRateBatch);
  });

  messaging.peerSocket.addEventListener("error", (err) => {
    console.error(`App - Connection error: ${err.code} - ${err.message}`);
  });
}


function sendMessage(timestampText, heartRateBatch) {
  const data = {
    title: 'Heart Rate Metrics',
    isTest: true,
    timestamp: timestampText,
    records: [1, 2, 3, 4],
    heartRate: heartRateBatch
  }

  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    // Send the data to peer as a message
    messaging.peerSocket.send(data);
    var dataText = JSON.stringify(data);
    console.log(`App - sending: ${dataText}`);
  }
}
