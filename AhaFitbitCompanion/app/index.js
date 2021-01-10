//
//  index.js - Entry point for the watch app
//
//import clock from "clock";
//import document from "document";

// import * as message from "./util/message.js";

// import {senseHeartClock} from "./senseHeartClock.js"
// import {getHeartRate} from "./senseHeartClock.js"
// import {getCurrentTimeLabel} from "./senseHeartClock.js"
import * as heartActivityMonitor from "./heartActivityMonitor.js"

//var timestampText = "xx:yy"

// sense heart clock
heartActivityMonitor.start();

// message.openMessaging();

// // 
// messaging.peerSocket.addEventListener("open", (evt) => {
//   console.log("App - Ready to send or receive messages");
//   sendMessage();
// });

// messaging.peerSocket.addEventListener("error", (err) => {
//   console.error(`App - Connection error: ${err.code} - ${err.message}`);
// });

// // let demotext = document.getElementById("demotext");
// // demotext.text = "Fitbit Studio rocks!";

// function sendMessage() {
//   timestampText = senseHeartClock.getCurrentTimeLabel()
//   // Sample data
//   const data = {
//     title: 'My test data',
//     isTest: true,
//     records: [1, 2, 3, 4],
//     heartRate: senseHeartClock.getHeartRate(),
//     timestamp: timestampText
//   }

//   if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
//     // Send the data to peer as a message
//     messaging.peerSocket.send(data);
//   }
// }
