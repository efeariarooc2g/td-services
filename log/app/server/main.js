import when from 'when';
import promiseRedis from 'promise-redis';
//const amqplib = require('amqplib');

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
const CACHE_DOMAIN = 'log:';
const MSGKEYS_TTL = 1800;


_.extend(Core, {
    initCache: function() {
    	// Retrieve a when-based promisefactory for redis
    	const promiseFactory = when.promise;
    	const redis = promiseRedis(promiseFactory);
    	let redisPort = process.env.REDIS_PORT || 6379;
		let client = redis.createClient(redisPort, process.env.REDIS_HOST, {});

		client.on("error", function (err) {
		    Core.Log.error(`Redis Client Error: ${err}`);
		});
		return client;
    },
    initQueue: function() {
        let processMessage = Meteor.bindEnvironment(function(callback){
            callback()
        });

        let cache;

        try {
        	cache = this.initCache();
        } catch (e) {
        	Core.Log.error(`Cannot connect to cache: ${e}`);
        }
        
        
		let onMessage = function(msg) {
            let newMessage = msg.content.toString();
            if (newMessage){
                
                // retrieve id from message and test for uniqueness
                let msgObj = JSON.parse(newMessage);
                let messageKey = CACHE_DOMAIN + 'mkey:' + msgObj._id;
                Core.Log.info(`Received a new message for ${msgObj.collectionName}.${msgObj.event}`);
                cache.get(messageKey)
                	.then(function(mkey){
                		if (!mkey) {
                			processMessage(function(){
	                            Meteor.defer(function(){
	                            	Core.Log.info(`Processing message ${msgObj.collectionName}.${msgObj.event} with key: ${messageKey}`);
                					Meteor.call("audits/logEvent", newMessage, function (err, result) {
	                                    if (!err) {
	                                    	Core.Log.info(`Success from audits/logEvent for ${msgObj.collectionName}.${msgObj.event} with key: ${messageKey}. Sending ack...`);
	                                    	cache.setex(messageKey, MSGKEYS_TTL, 'OK'); // set key with expiry
	                                        channelWrapper.ack(msg);
	                                    } else {
											Core.Log.warn(err);
										}
	                                });
	                            })
	                        });
                		} else {
                			Core.Log.warn(`Duplicate message, ${messageKey} ignored, resending ack`);
                			channelWrapper.ack(msg);
                		}
                	}).catch(function(err) {
                		Core.Log.error(`Error retrieving message key from cache: ${err}`);
                	});  
            }
        };

        
        const amqp = Npm.require('amqp-connection-manager');
        const q = 'log.events.in';
        
        const opts = {
        	connectionOptions: {
        			rejectUnauthorized: false           // set to false
			}
		};

		Core.Log.info('Connecting to the messaging server...');
		connection = amqp.connect([process.env.RABBIT_URL], opts);

		connection.on('connect', function() {
		    Core.Log.info('Connected!');
		});
		connection.on('disconnect', function(params) {
		    Core.Log.warn('Disconnected.', params.err);
		});

		// Set up a channel listening for messages in the queue.
		let channelWrapper = connection.createChannel({
		    setup: function(channel) {
		        // `channel` here is a regular amqplib `ConfirmChannel`.
		        return when.all([
		            channel.assertQueue(q, {durable: true}),
		            channel.prefetch(1),
		            channel.consume(q, onMessage, {noAck: false})
		        ]);
		    }
		});

		channelWrapper.waitForConnect()
			.then(function() {
			    Core.Log.info(`Listening for messages on ${q}...`);
			});

			/*
        
        const amqplib = Npm.require('amqplib');
        const q = 'log.events.in';
        const opts = {
			rejectUnauthorized: false           // set to false
		};

		Core.Log.info('Connecting to the messaging server...');
		open = amqplib.connect(process.env.RABBIT_URL, opts);
	    
	    let channelWrapper;

	    open.then(function(conn) {
	      return conn.createChannel();
	    }).then(function(ch) {
	    	channelWrapper = ch;
	        
	        ch.on('error', function(err) {
	            Core.Log.error(`Channel error: ${err}`);
	        });
	        
	        return ch.assertQueue(q, {durable: true}).then(function(){
	            Core.Log.info(`Waiting for messages on ${q}...`);
	            ch.prefetch(1);
	            return ch.consume(q, onMessage, {noAck: false});
	            
	        }).catch(function(err) {
	            Core.Log.error(`Error asserting queue: ${err}`);
	        });
	    }).catch(function(err) {
	        Core.Log.error(`Cannot connect to the messaging server: ${err}`);
	    });
	    */
		

		/*
        amqplib.connect(process.env.RABBIT_URL, opts, function(err, conn) {
        	if (err) {
        		Core.Log.error(`Cannot connect to the messaging server: ${err}`);
        	} else {
	            Core.Log.info('Connected to the messaging server');
	            conn.createChannel(function(err, ch) {
	                const q = 'log.events.in';
	                ch.on('error', function(err) {
			            Core.Log.error(`Channel error: ${err}`);
			        });

	                ch.assertQueue(q, {durable: true});
	                ch.prefetch(1);
	                Core.Log.info("Waiting for messages on " + q);
	                ch.consume(q, function(msg) {
	                    let newMessage = msg.content.toString();
	                    if (newMessage){
	                        Core.Log.info("Received a new message");
	                        
	                        // retrieve id from message and test for uniqueness
	                        let msgObj = JSON.parse(newMessage);
	                        let messageKey = CACHE_DOMAIN + 'mkey:' + msgObj._id;
	                        cache.get(messageKey)
	                        	.then(function(mkey){
	                        		if (!mkey) {
	                        			processMessage(function(){
				                            Meteor.defer(function(){
				                                Meteor.call("audits/logEvent", newMessage, function (err, result) {
				                                    if (!err) {
				                                    	cache.setex(messageKey, MSGKEYS_TTL, 'OK'); // set key with expiry
				                                        ch.ack(msg);
				                                    }
				                                });
				                            })
				                        });
	                        		} else {
	                        			Core.Log.warn(`Duplicate message, ${messageKey} ignored`);
	                        		}
	                        	}).catch(Core.Log.warn);                      
	                    }
	                }, {noAck: false});
	            });
	        }
        });*/

    }
});

Meteor.startup(function () {
	Core.initQueue();
});
