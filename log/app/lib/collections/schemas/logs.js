Core.Schemas.Log = new SimpleSchema({
    _id: {
        type: String,
        optional: true
    },
    message: {
        type: String,
        denyUpdate: true
    },
    level: {
        type: String,
        denyUpdate: true,
        allowedValues: ["FATAL", "ERROR", "WARN", "INFO", "EVENT"]
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
        optional: true
    },
    userId: {
        type: String,
        denyUpdate: true,
        optional: true
    }
});