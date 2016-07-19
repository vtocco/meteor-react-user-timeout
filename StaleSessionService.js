import {Meteor} from 'meteor/meteor';

/*
 Server side activity detection for the session timeout

 Meteor settings:
 - staleSessionInactivityTimeout: the amount of time (in ms) after which, if no activity is noticed, a session will be considered stale
 - staleSessionPurgeInterval: interval (in ms) at which stale sessions are purged i.e. found and forcibly logged out

 Stale session pulled from:
 https://atmospherejs.com/zuuk/stale-session
 All in milliseconds, so (minutes * 60 * 1000)
 */

const staleSessionPurgeInterval = Meteor.settings && Meteor.settings.staleSessionPurgeInterval || (1 * 60 * 1000); // 1min
const inactivityTimeout = Meteor.settings && Meteor.settings.public && Meteor.settings.public.staleSessionInactivityTimeout + 1000 || (30 * 60 * 1000 + 1000); // 30mins


//
// provide a user activity heartbeat method which stamps the user record with a timestamp of the last
// received activity heartbeat.
//
Meteor.methods({
    heartbeat: function () {
        if (!this.userId) {
            return;
        }
        let user = Meteor.users.findOne(this.userId);

        if (user) {
            Meteor.users.update(user._id, {$set: {heartbeat: new Date()}});
        }
    }
});


//
// periodically purge any stale sessions, removing their login tokens and clearing out the stale heartbeat.
//
Meteor.setInterval(function () {
    let now = new Date(), overdueTimestamp = new Date(now - inactivityTimeout);
    Meteor.users.update({heartbeat: {$lt: overdueTimestamp}},
        {
            $set: {'services.resume.loginTokens': []},
            $unset: {heartbeat: 1}
        },
        {multi: true});
}, staleSessionPurgeInterval);
