// 
// message.js - wrapper for messaging api
//
import * as messaging from "messaging";
import * as senseHeartClock from "../senseHeartClock.js"

const MESSAGE_BUFFER_MAX = 1024;

let timestampText = "xx:yy";
let msgSequence = 0;
let msgTally = 0;
let msgReturnCode = false;

export function openMessaging(timestampText, heartRateBatch) {
  messaging.peerSocket.addEventListener("open", (evt) => {
    console.log("App - Ready to send or receive messages");
    msgReturnCode = sendMessage(timestampText, heartRateBatch);
    return msgReturnCode;
  });

  messaging.peerSocket.addEventListener("error", (err) => {
    console.error(`App - Connection error: ${err.code} - ${err.message}`);
  });
}


function sendMessage(timestampText, heartRateBatch) {
  const data = {
    title: 'Heart Rate Metrics',
    msgSequence: msgSequence,
    isTest: true,
    timestamp: timestampText,
    records: [1, 2, 3, 4],
    heartRate: heartRateBatch
  }

  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    if (messaging.peerSocket.bufferedAmount < MESSAGE_BUFFER_MAX) {
      // Send the data to peer as a message
      messaging.peerSocket.send(data);
      let dataText = JSON.stringify(data);
      console.log(`App - sending: ${dataText}`);
      // bump message sequence # & tally
      ++msgSequence;
      ++msgTally;
      // send success
      return true;
    }
    console.log(`App - send failure buffered amount: ${messaging.peerSocket.bufferedAmount}`);
  }
  // send failure
  console.log(`App - send failure buffered amount: ${messaging.peerSocket.readyState}`);
  return false; 
}
