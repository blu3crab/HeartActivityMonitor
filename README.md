# HeartActivityMonitor - published in the fitbit gallery as SimplyHeart
Fitbit on-device &amp; companion app w/ heart shape clock shows 1 second updates &amp; sends HeartRate metric collection every 8 seconds.

<h1> Build with-> FitbitDeveloper IDE: https://studio.fitbit.com

<h1> Project structure ->

<h2>AhaHAMApp folder
	<h3>app folder 
		<h4> heartActivityMonitor.js -> 
    <h5> sets up app to monitor heart sensor
    <h5> updates watch display
    <h5> sends metrics to comanion
		<h4> index.js -> starts heartActivityMonitor
		<h4> util folder
			<h5> format.js
      <h5> message.js  -> Fitbit messaging API
	<h3> companion folder
		<h4> index.js -> receives HR metrics & sends to Fitbit app on phone
	<h3> resources folder
		<h5> icons, view definitions, styles, etc.
	
  <h3> package.json -> project manifest
