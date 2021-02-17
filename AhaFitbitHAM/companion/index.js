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
  
  // get ham info
  console.log('http://127.0.0.1:8080/about GET');

  //fetch('http://192.168.1.6:8080/about', {
  fetch('http://127.0.0.1:8080/about', {
    method:'get',
  }).then(function(response) {
    if (!response.ok) {
      console.log("Companion - GET " + response.status + ': ' + response.statusText);
      return;
    }
    console.log(response.text());
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
    if (!result.ok) {
      console.log("Companion - POST " + result.status + ': ' + result.statusText);
      return;
    }
    console.log('enviado el paquete...');
  }).catch(function (err){
    console.log(`fetch https post failure - ${err}`)
  })
});

console.log("Companion code started");
