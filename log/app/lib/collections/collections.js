Events = new Mongo.Collection("events");
Partitioner.partitionCollection(Events);
Events.attachSchema(Core.Schemas.Event);

Logs = new Mongo.Collection("logs");
Partitioner.partitionCollection(Logs);
Logs.attachSchema(Core.Schemas.Log);


NewEvents = new SQL.Collection('events');


if (Meteor.isServer){
    NewEvents.createTable({objectType: ['$string'], objectTypeId: ['$string'],
        eventType: ['$string'], userId: ['$string'], groupId: ['$string'],
        activities: ['$json']}).save();
}