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
  
    // Send information to the server
  fetch('http://localhost:/heartRate', {
    method:'post',
    headers: {
     'Content-Type': 'application/json'
    },
    body:JSON.stringify(evt.data)
  }).then(function(result) {
    if (!result.ok) {
      console.log(result.status + ': ' + result.statusText);
      return;
    }
    console.log('enviado el paquete...');
  }).catch(function (err){
    console.log(err)
  })
});

console.log("Companion code started");
