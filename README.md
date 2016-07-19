# meteor-react-user-timeout
#React component for Meteor that detects user inactivity and logs them out. Pops up a warning Modal. 
#Keeps track on the server using a heartbeat. Once user times out (either closing browser or leaving it open) then they are logged out on the server. 

#Utilizes react-router

#Installation:
#This uses the react aria modal for user popup, must install this first
npm install --save react-aria-modal

#Client:
#Import the timeout.css class somewhere so the client sees it (modalclass)

#Currently we use react-router, if you don't use that, then remove the "contextTypes" section, and "this.context.router.replace('/app/login');" line

#In your top-level program, typically main.jsx or app.jsx
import UserTimeout from './UserTimeout';

#Then in your render method of it:
<UserTimeout />

#Server:
#You must import the "StateSessionService.js" file somewhere in your Meteor server only code (good idea is to use a startup directory).
#This will add the heartbeat method which will update the users last seen timer. 
#This will also run a function that logs out users who have not sent a heartbeat in the configurable time. 
import './StaleSessionService';

#Also copy the contents of settings.json into your settings.json file
#Make sure to start Meteor like this which will import them:  "Meteor --settings settings.json"
