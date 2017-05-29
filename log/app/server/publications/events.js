Meteor.publish("Events", function (group) {
    return Events.find();
});



Meteor.publish("Event", function (id, group) {
    return Event.findOne(id);
});
