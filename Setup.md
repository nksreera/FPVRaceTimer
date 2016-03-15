Download and install the latest raspbian image to a sd card

follow the instructions here to setup an access point 
https://learn.adafruit.com/setting-up-a-raspberry-pi-as-a-wifi-access-point?view=all

Follow instructions here to install Node.js
https://learn.adafruit.com/node-embedded-development/installing-node-dot-js

Get the sources from this git repository

then goto src/webserver and run the following to install node dependencies
npm install express
npm install socket.io
npm install sqlite3
npm install node-serialize
npm install body-parser

then do sudo node server.js to start the service
