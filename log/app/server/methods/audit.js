/*****************************************************************************/
/*  Server Methods */
/*****************************************************************************/

Meteor.methods({
    'audits/logEvent': function (object) {
        this.unblock();
        object = JSON.parse(object);
        if (object.groupId){
            let oldDoc = object.oldData;
            let newDoc = object.newData;
            let event = object.event;
            let collectionName = object.collectionName;
            let docId = object.docId;
            let user =  object.user;
            let group = object.groupId;
            if (collectionName === "order" && newDoc.status === "accepted" && oldDoc.status !== "accepted"){
                event = "accepted"
            }

            if (collectionName === "order" && newDoc.status === "cancelled" && oldDoc.status !== "cancelled"){
                event = "cancelled"
            }
            delete oldDoc.history;
            delete newDoc.history;
            let eventLogs = diff(oldDoc, newDoc);
            let doc = {};
            let res;
            doc.objectTypeId = docId;
            doc.objectType = collectionName;
            doc.userId = user.userId;
            doc.eventType = event;
            doc.activities = eventLogs;
            check(doc, Core.Schemas.Event);
             NewEvents.insert({
                objectType: doc.objectType,
                objectTypeId: doc.objectTypeId,
                eventType: doc.eventType,
                userId: doc.userId,
                groupId: group,
                activities: {eventLog: doc.activities}
                })
                .save();
        } else {
            Core.Log.warn("No groupId for " + object.collectionName + " with document Id " + object.docId);
        }
    },

    'audits/get': function (limit, group) {
        limit = limit || 50;
        this.unblock();
         return NewEvents.select('id', 'objectType', 'objectTypeId', 'createdat', 'eventType', 'userId', 'groupId', 'eventId', 'activities' )
             .where("groupId = ?", group).order('createdat DESC').limit(limit)
             .fetch();
    }
}, Meteor.bindEnvironment(function (error, result) {
}));


function diff(a, b, objectKey, reference) {
    var log = [];
    var logObject = {};

    if (b && typeof b === 'object' && Object.keys(b).length === 0) {
        return log;
    }

    var object = {};
    // get keys for base object
    if(a){
        var keys = Object.keys(a);

        // loop through
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            if (b.hasOwnProperty(key)) {

                if (a[key] === b[key]) {

                } else {
                    // check for array type
                    if (a[key] instanceof Array || b[key] instanceof Array) {

                        if (a[key].length > 0 && typeof a[key][0] !== 'object') {
                            var aString = a[key].join(', ');
                            var bString = b[key].join(', ');
                            if (aString !== bString) {
                                log.push({
                                    event: 'changed',
                                    referenceKey: key,
                                    referenceId: reference ? reference : '',
                                    oldValue: aString,
                                    newValue: bString
                                });
                            }
                        } else {
                            // check for removal and presence
                            for (var x = 0; x < a[key].length; x++) {

                                object = find(a[key][x], b[key]);

                                if (object) {
                                    log = log.concat(diff(a[key][x], object, key, a[key][x]._id));
                                } else {
                                    logObject = {
                                        event: 'removed',
                                        referenceKey: key + '.' + a[key][x]._id,
                                        referenceId: a[key][x]._id
                                    };
                                    log.push(logObject);
                                }

                            }

                            // check for addition
                            for (var y = 0; y < b[key].length; y++) {

                                object = find(b[key][y], a[key]);

                                if (!object) {
                                    log = log.concat(diff({}, b[key][y], key, b[key][y]._id));
                                }


                            }
                        }

                    } else if ((a[key] && typeof a[key] === 'object') || (b[key] && typeof b[key] === 'object')) {
                        // object check
                        var newKey = '';
                        if (objectKey) {
                            newKey = objectKey + '.' + key;
                        } else {
                            newKey = key;
                        }
                        log = log.concat(diff(a[key], b[key], newKey, reference));
                    } else {
                        // primitive check
                        if (objectKey) {
                            logObject = {
                                event: 'changed',
                                referenceKey: objectKey + '.' + key,
                                referenceId: reference ? reference : '',
                                oldValue: a[key] ? (a[key]).toString() : '',
                                newValue: b[key] ? (b[key]).toString() : ''
                            };
                        } else {
                            logObject = {
                                event: 'changed',
                                referenceKey: key,
                                referenceId: reference ? reference : '',
                                oldValue: a[key] ? (a[key]).toString() : '',
                                newValue: b[key] ? (b[key]).toString() : ''
                            };
                        }
                        log.push(logObject);
                    }
                }
            } else {
                // it has been removed then
                logObject = {
                    event: 'removed',
                    referenceKey: key
                };
                log.push(logObject);
            }
        }
    }


    if (b && a){
        keys = Object.keys(b);
        for (i = 0; i < keys.length; i++) {
            var bKey = keys[i];
            if (!a.hasOwnProperty(bKey)) {
                var bNewKey = '';
                if (objectKey) {
                    bNewKey = objectKey + '.' + bKey;
                } else {
                    bNewKey = bKey;
                }
                if (typeof b[bKey] === 'object') {
                    if (b[bKey] instanceof Array) {
                        if (b[bKey].length > 0 && b[bKey][0] && typeof b[bKey][0] !== 'object') {
                            log.push({
                                event: 'set',
                                referenceKey: bNewKey,
                                referenceId: reference ? reference : '',
                                oldValue: '',
                                newValue: b[bKey].join(', ')
                            });
                        } else {
                            _.each(b[bKey], function(object) {
                                log = log.concat(diff({}, object, bNewKey, reference));
                            });
                        }
                    } else {
                        if (b[bKey]){
                            log = log.concat(diff({}, b[bKey], bNewKey, reference));
                        }
                    }
                } else {

                    logObject = {
                        event: 'set',
                        referenceKey: bNewKey,
                        referenceId: reference ? reference : '',
                        oldValue: '',
                        newValue: b[bKey] ? (b[bKey]).toString() : ''
                    };
                    log.push(logObject);

                }
            }
        }
    }
    return log;
}


function find(object, array) {
    for (var i = 0; i < array.length; i++) {
        if (object._id == array[i]._id) {
            return array[i];
        }
    }
    return false;
}
