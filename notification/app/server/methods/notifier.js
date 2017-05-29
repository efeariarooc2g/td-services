

/**
 *  Notifications Methods
 */
Meteor.methods({
    "notifier/renderMessage": function (object) {
        this.unblock();
        object = JSON.parse(object);
        if (object.event !== "customer.created") {
            Meteor.call(Core.eventMap[object.event], object);
        }
    }
});

