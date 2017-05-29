Meteor.publish("Logs", function (group) {
    return Logs.find();
});



Meteor.publish("Log", function (id, group) {
    return Logs.findOne(id);
});
