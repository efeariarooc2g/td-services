import { Meteor } from 'meteor/meteor';

import when from 'when';
import promiseRedis from 'promise-redis';
import accounting from 'accounting';
import amqplib from 'amqplib'

/**
 * Application Startup
 * Core Server Configuration
 */

/**
 * configure bunyan logging module for reaction server
 * See: https://github.com/trentm/node-bunyan#levels
 */
const levels = ["FATAL", "ERROR", "WARN", "INFO", "DEBUG", "TRACE"];
const mode = process.env.NODE_ENV || "production";
let isDebug = Meteor.settings.isDebug || process.env.REACTION_DEBUG || "INFO";

if (isDebug === true || mode === "development" && isDebug !== false) {
    if (typeof isDebug !== "boolean" && typeof isDebug !== undefined) {
        isDebug = isDebug.toUpperCase();
    }
    if (!_.contains(levels, isDebug)) {
        isDebug = "WARN";
    }
}

if (process.env.VELOCITY_CI === "1") {
    formatOut = process.stdout;
} else {
    formatOut = logger.format({
        outputMode: "short",
        levelInString: false
    });
}

Core.Log = logger.bunyan.createLogger({
    name: "core",
    stream: isDebug !== "DEBUG" ? formatOut : process.stdout,
    level: "debug"
});

// set logging level
Core.Log.level(isDebug);


// cache parameters
const CACHE_DOMAIN = 'notification:';
const MSGKEYS_TTL = 1800;


_.extend(Core, {
    initCache: function() {
        // Retrieve a when-based promisefactory for redis
        const promiseFactory = when.promise;
        const redis = promiseRedis(promiseFactory);
        let redisPort = process.env.REDIS_PORT || 6379;

        return redis.createClient(redisPort, process.env.REDIS_HOST, {});
    },
    initQueue: function() {
        let processMessage = Meteor.bindEnvironment(function(callback){
            callback()
        });

        let cache = this.initCache();
        const q = 'notification.events.in';
        const opts = {
            rejectUnauthorized: false           // set to false
        };

        Core.Log.info('Connecting to the messaging server...');
        open = amqplib.connect(process.env.RABBIT_URL, opts);

        open.then(function(conn) {
            return conn.createChannel();
        }).then(function(ch) {

            ch.on('error', function(err) {
                Core.Log.error(`Channel error: ${err}`);
            });

            return ch.assertQueue(q, {durable: true}).then(function(){
                Core.Log.info(`Waiting for messages on ${q}...`);
                ch.prefetch(1);
                return ch.consume(q, function(msg) {
                    let newMessage = msg.content.toString();
                    if (newMessage){

                        // retrieve id from message and test for uniqueness
                        let msgObj = JSON.parse(newMessage);
                        let messageKey = CACHE_DOMAIN + 'mkey:' + msgObj._id;
                        Core.Log.info(`Received a new message for ${msgObj.event}`);
                        cache.get(messageKey)
                            .then(function(mkey){
                                if (!mkey) {
                                    processMessage(function(){
                                        Meteor.defer(function(){
                                            Meteor.call("notifier/renderMessage", newMessage, function (err, result) {
                                                if (!err) {
                                                    cache.setex(messageKey, MSGKEYS_TTL, 'OK'); // set key with expiry
                                                    ch.ack(msg);
                                                } else {
                                                    Core.Log.error(err);
                                                }
                                            });
                                        })
                                    });
                                } else {
                                    Core.Log.warn(`Duplicate message, ${messageKey} ignored`);
                                }
                            }).catch(function(err) {
                            Core.Log.error(`Error retrieving message key from cache: ${err}`);
                        });
                    }
                });

            }).catch(function(err) {
                Core.Log.error(`Error asserting queue: ${err}`);
            });
        }).catch(function(err) {
            Core.Log.error(`Cannot connect to the messaging server: ${err}`);
        });
    },
    numberWithCommas: function(x, num) {
        return num ? accounting.formatNumber(x, num) : accounting.formatNumber(x);
    },
    numberWithDecimals: function(x) {
        return accounting.formatNumber(x, 2);
    }
});

Meteor.startup(function () {
    Core.initQueue();
});