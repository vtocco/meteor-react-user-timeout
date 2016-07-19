import React from 'react';
import {Meteor} from 'meteor/meteor';
import AriaModal from 'react-aria-modal';

const heartbeatInterval = Meteor.settings && Meteor.settings.public && Meteor.settings.public.staleSessionHeartbeatInterval || (3 * 60 * 1000); // 3mins
const inactivityTimeout = Meteor.settings && Meteor.settings.public && Meteor.settings.public.staleSessionInactivityTimeout || (30 * 60 * 1000); // 30mins

let activityDetected = true;

const events = ['mousemove'
    , 'keydown'
    , 'wheel'
    , 'DOMMouseScroll'
    , 'mouseWheel'
    , 'mousedown'
    , 'touchstart'
    , 'touchmove'
    , 'MSPointerDown'
    , 'MSPointerMove'
];

let counter = 0;

const UserTimeout = React.createClass({
    displayName: "User Activity Timer",

    contextTypes: {
        router: React.PropTypes.object.isRequired
    },

    getInitialState(){
        return {
            initialtimer: '',
            modalIsOpen: false
        }
    },


    userStaleTimer() {
        "use strict";

        let timedout = Math.floor(inactivityTimeout / heartbeatInterval) || 1;
        let warning = 1;

        if (timedout > 1) {
            warning = timedout - 1;
        }

        if (Meteor.userId() && activityDetected) {
            Meteor.call('heartbeat');
            activityDetected = false;
            counter = 0;
        }

        else {
            counter++;

            if (counter == warning) {
                this.setState({modalIsOpen: true});
            }

            //logging out for inactivity
            if (counter >= timedout) {
                this.context.router.replace('/app/login');
                Meteor.logout();
            }
        }
    },

    componentDidMount() {
        "use strict";

        //send one right away
        Meteor.call('heartbeat');

        //we need to setup the event listeners for mouse movement, etc
        //this will reset the counters
        events.forEach(e => document.addEventListener(e, this.handleActivity));

        let result = Meteor.setInterval(this.userStaleTimer, heartbeatInterval);

        this.setState({
            initialtimer: result
        });
    },


    componentWillUnmount () {
        "use strict";

        //unmount them when your app goes away
        events.forEach(e => document.removeEventListener(e, this.handleActivity));

        this.setState({modalIsOpen: false});

        Meteor.clearInterval(this.state.initialtimer);

    },

    handleActivity(){
        "use strict";

        if (activityDetected === false) {
            //console.log('Activity Detected');
            activityDetected = true;

            //dont need the modal
            this.setState({modalIsOpen: false});

        }
    },

    render(){

        return (
            <div tabIndex="-1" role="dialog">

                <AriaModal
                    mounted={this.state.modalIsOpen}
                    onExit={this.handleActivity}
                    escapeExits={true}
                    titleText='Inactivity Timer'
                    underlayClickExits={true}
                    verticallyCenter={true}
                    underlayClass="modalclass"
                >

                    <div className="modal-content">
                        <div className="modal-header">
                            <button type="button" className="close" data-dismiss="modal">&times;</button>
                            <h4 className="modal-title">Inactivity Timer</h4>
                        </div>
                        <div className="modal-body">
                            <p>Please click to continue your session. </p>
                            <p>If not, you will be logged out for security. </p>
                            <p>Thank you</p>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-default" data-dismiss="modal">Close
                            </button>
                        </div>
                    </div>

                </AriaModal>
            </div>
        );
    }
});

export default UserTimeout;
