///////////////////////////////////////////////////////////////////////////////
// index.js by  M.A.Tucker 01JAN2021
// - Entry point for the companion app
//
import * as messaging from "messaging";

///////////////////////////////////////////////////////////////////////////////
// companion app communication
const COMPANION_MESSAGING_ENABLED = true

if (COMPANION_MESSAGING_ENABLED) {
  messaging.peerSocket.addEventListener("open", (evt) => {
    console.log("Companion - Ready to send or receive messages");
  });

  messaging.peerSocket.addEventListener("error", (err) => {
    console.error(`Companion - Connection error: ${err.code} - ${err.message}`);
  });


  messaging.peerSocket.addEventListener("message", (evt) => {
    console.log(JSON.stringify(evt.data));

    // get ham info
    console.log('http://127.0.0.1:8080/about GET');

    //fetch('http://192.168.1.6:8080/about', {
    fetch('http://127.0.0.1:8080/about', {
      method:'get',
    }).then(function(response) {
      console.log("Companion - GET " + response.status + ': ' + response.statusText);
      if (!response.ok) {
        console.log("Companion - GET response !OK ->" + response.status + ': ' + response.statusText);
        return;
      }
      console.log("Companion - GET returns ->" + response.text());
    }).catch(function (err){
      console.log(`fetch https get failure - ${err}`)
    })

    console.log('http://127.0.0.1:8080/heartRate POST');
    //fetch('http://localhost:8080/heartRate', {
    //fetch('http://192.168.1.6:8080/heartRate', {
    fetch('http://127.0.0.1:8080/heartRate', {
      method:'post',
      headers: {
       'Content-Type': 'application/json'
      },
      body:JSON.stringify(evt.data)
    }).then(function(result) {
      console.log("Companion - POST " + response.status + ': ' + response.statusText);
      if (!result.ok) {
        console.log("Companion - POST response !OK -> " + result.status + ': ' + result.statusText);
        return;
      }
      console.log('enviado el paquete...');
    }).catch(function (err){
      console.log(`fetch https post failure - ${err}`)
    })
  });
  console.log("Companion startup ENABLED...");
}
console.log("Companion startup DISABLED...");
