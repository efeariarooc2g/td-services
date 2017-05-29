const levels = ["FATAL", "ERROR", "WARN", "INFO", "EVENT", "DEBUG"];
const mode = process.env.NODE_ENV || "production";
let isDebug = Meteor.settings.isDebug || process.env.REACTION_DEBUG || "INFO";

if (process.env.VELOCITY_CI === "1") {
    formatOut = process.stdout;
} else {
    formatOut = logger.format({
        outputMode: "short",
        levelInString: false
    });
}

if (isDebug === true || mode === "development" && isDebug !== false) {
    if (typeof isDebug !== "boolean" && typeof isDebug !== undefined) {
        isDebug = isDebug.toUpperCase();
    }
    if (!_.contains(levels, isDebug)) {
        isDebug = "WARN";
    }
}




Meteor.methods({
    'logs/create': function (message, level, userId, group) {

        let availableLevel =  _.find(levels, function(l){return level === l});
        if (!availableLevel){
           throw new Meteor.Error(404, "Log level not found")
        }

        check(message, String);
        check(level, String);
        check(group, String);
        let doc = {};
        doc.message = message;
        doc.level = level;
        doc.userId = userId;
        this.unblock();

        if (level !== "INFO"){
            Partitioner.bindGroup(group, function () {
                Logs.insert(doc);
            });
        }

        Core.Log = logger.bunyan.createLogger({
            name: "core",
            stream: isDebug !== "DEBUG" ? formatOut : process.stdout,
            level: level === "EVENT" ? "info" : lowerCase(level)
        });


        if (level == "INFO"){
            Core.Log.info(message, userId, group)
        } else if (level == "WARN") {
            Core.Log.warn(message, userId, group)
        } else if (level === "ERROR"){
            Core.Log.error(message, userId, group)
        } else if (level === "FATAL") {
            Core.Log.fatal(message, userId, group)
        } else if (level === "EVENT") {
            Core.Log.info(message, userId, group)
        }


    },

    'logs/get': function (userId, options, group) {
        this.unblock();
        Partitioner.bindGroup(group, function () {
            Logs.find({}, options).fetch();
        });
    }
});


function lowerCase(str){
    let string = str.replace(/[_-]/g, " ");
    return string.toLowerCase();
}