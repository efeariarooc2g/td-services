Core.Schemas.Activity = new SimpleSchema({
    oldValue: {
        type: String,
        denyUpdate: true,
        optional: true
    },
    newValue: {
        type: String,
        denyUpdate: true,
        optional: true
    },
    referenceId: {
        type: String,
        denyUpdate: true,
        optional: true
    },
    referenceKey: {
        type: String,
        denyUpdate: true,
        optional: true
    },
    event: {
        type: String,
        denyUpdate: true,
        optional: true
    }
});

Core.Schemas.Event = new SimpleSchema({
    _id: {
        type: String,
        optional: true
    },
    objectType: {
        type: String,
        denyUpdate: true,
        optional: true
    },
    objectTypeId: {
        type: String,
        denyUpdate: true,
        optional: true
    },
    eventType: {
        type: String,
        denyUpdate: true,
        optional: true
    },
    createdAt: {
        type: Date,
        autoValue: function () {
            if (this.isInsert) {
                return new Date;
            } else if (this.isUpsert) {
                return {
                    $setOnInsert: new Date
                };
            }
        },
        denyUpdate: true,
        optional: true
    },
    activities: {
        type: [Core.Schemas.Activity],
        optional: true
    },
    userId: {
        type: String,
        denyUpdate: true,
        optional: true
    }
});