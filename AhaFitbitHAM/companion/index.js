/*
 * Entry point for the companion app
 */
import * as messaging from "messaging";

messaging.peerSocket.addEventListener("open", (evt) => {
  console.log("Companion - Ready to send or receive messages");
});

messaging.peerSocket.addEventListener("error", (err) => {
  console.error(`Companion - Connection error: ${err.code} - ${err.message}`);
});


messaging.peerSocket.addEventListener("message", (evt) => {
  console.log(JSON.stringify(evt.data));
});

console.log("Companion code started");
