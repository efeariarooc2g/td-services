

/**
 * This is a sample Lambda function that sends an Email on click of a
 * button. It creates a SNS topic, subscribes an endpoint (EMAIL)
 * to the topic and publishes to the topic.
 *
 * Follow these steps to complete the configuration of your function:
 *
 * 1. Update the EMAIL variable with your email address.
 * 2. Enter a name for your execution role in the "Role name" field.
 *    Your function's execution role needs specific permissions for SNS operations
 *    to send an email. We have pre-selected the "AWS IoT Button permissions"
 *    policy template that will automatically add these permissions.
 */


/**
 * The following JSON template shows what is sent as the payload:
 {
	"sim": {
        "id": 788,
        "iccid": "736826736473829773621",
        "imsi": "901991234567890",
        "msisdn": "+88563748761"
    },

    "imei": "864345678889321",
    "imei_lock": true,
    "ip_address": "10.203.23.75",
 }
 * for IOT button
 {
  "serialNumber": "G030JF0582620VH3",
  "clickType": "SINGLE",
  "batteryVoltage": "1759mV"
 }
 *
 * A "LONG" clickType is sent if the first press lasts longer than 1.5 seconds.
 * "SINGLE" and "DOUBLE" clickType payloads are sent for short clicks.
 *
 * For more documentation, follow the link below.
 * http://docs.aws.amazon.com/iot/latest/developerguide/iot-lambda-rule.html
 */

import AWS from 'aws-sdk';
import rp from 'request-promise'
import bluebird from 'bluebird'

AWS.config.setPromisesDependency(bluebird);
//use global promise

const EMAIL = process.env.email;
const SNS = new AWS.SNS({ apiVersion: '2010-03-31' });

const sqs = new AWS.SQS();
let queueUrl = "";
let receipt  = "";
let customer;
const QueueName = "OrderRequest";
const LeedsQueueName = "LeedsRequest";
const apiUrl = 'https://td-central.herokuapp.com/api/v2/retailer/?';



exports.handler = (event, context, callback) => {
    console.log('Received event:', event);
    //handle only post request
    if(event.hasOwnProperty('sim')){ // triggered by api gateway
        let responseCode = 200;
        const responseBody = {
            message: "Request received"
        };
        let response = {};
        switch (event.httpMethod) {
            case "POST":
                response = {
                    statusCode: responseCode,
                    headers: {
                        "x-custom-header": "my custom header value"
                    },
                    body: JSON.stringify(responseBody)
                };
                //publish(event, context, callback);
                //process request
                getCustomerDetails({phone_number: event.body.sim.id}) //will use event.body.sim.id TODO change me
                    .then(data => {
                        customer = data;
                        return CreateQueue(QueueName)
                    })
                    .then(data => {
                        console.log(data);
                        return sendtoQueue(data.QueueUrl, JSON.stringify(customer))
                    })
                    .then(() => {
                        context.succeed(response);
                    })
                    .catch(err => {
                        console.log(err);
                    });

                break;

            default:
                responseBody.message = "Please make a POST request with the appropriate JSON payload";
                response = {
                    statusCode: 400,
                    headers: {
                        "x-custom-header": "my custom header value"
                    },
                    body: JSON.stringify(responseBody)
                };
                context.succeed(response);
        };
    } else if(event.hasOwnProperty('clickType')) {  //triggered by aws iot

        getCustomerDetails({iot_number: event.serialNumber}) //will use event.serialNumber TODO change me
            .then(data => {
                if(data.data.message === 'Nothing found'){
                    return CreateQueue(LeedsQueueName);
                } else {
                    customer = data;
                    return CreateQueue(QueueName)
                };
                //if customer is found, crate queue for orderRequest else create queue for Leads request


            })
            .then(data => {
                console.log(data);
                return sendtoQueue(data.QueueUrl, customer ? JSON.stringify(customer): JSON.stringify(event));
            })
            .then(() => {
                callback(null,'success');
            })
            .catch(err => {
                console.log(err);
            });

        // create/get topic
        createTopic('aws-iot-button-sns-topic', (err, topicArn) => {
            if (err) {
                return callback(err);
            }
            console.log(`Publishing to topic ${topicArn}`);
            // publish message
            const params = {
                Message: customer.clickType ? `A new Lead has been found with serial Number ${event.serialNumber} and added to the New Leads queue for further processing`
                    : `Order Request from ${customer.outletBusinessName}, Phone Number: ${customer.phoneNumber}, Address: ${customer.coordinates.formatted_address}. Request has been added to queue for further processing`,
                Subject: customer.clickType ? `New Lead Detected with Serial Number ${event.serialNumber}` : `New Order Request from ${customer.outletBusinessName}`,
                TopicArn: topicArn,
            };
            // result will go to function callback
            SNS.publish(params, callback);
        });
    } else {
        callback(null);
    }


};

function findExistingSubscription(topicArn, nextToken, cb) {
    const params = {
        TopicArn: topicArn,
        NextToken: nextToken || null,
    };
    SNS.listSubscriptionsByTopic(params, (err, data) => {
        if (err) {
            console.log('Error listing subscriptions.', err);
            return cb(err);
        }
        const subscription = data.Subscriptions.filter((sub) => sub.Protocol === 'email' && sub.Endpoint === EMAIL)[0];
        if (!subscription) {
            if (!data.NextToken) {
                cb(null, null); // indicate that no subscription was found
            } else {
                findExistingSubscription(topicArn, data.NextToken, cb); // iterate over next token
            }
        } else {
            cb(null, subscription); // a subscription was found
        }
    });
}

/**
 * Subscribe the specified EMAIL to a topic.
 */
function createSubscription(topicArn, cb) {
    // check to see if a subscription already exists
    findExistingSubscription(topicArn, null, (err, res) => {
        if (err) {
            console.log('Error finding existing subscription.', err);
            return cb(err);
        }
        if (!res) {
            // no subscription, create one
            const params = {
                Protocol: 'email',
                TopicArn: topicArn,
                Endpoint: EMAIL,
            };
            SNS.subscribe(params, (subscribeErr) => {
                if (subscribeErr) {
                    console.log('Error setting up email subscription.', subscribeErr);
                    return cb(subscribeErr);
                }
                // subscription complete
                console.log(`Subscribed ${EMAIL} to ${topicArn}.`);
                cb(null, topicArn);
            });
        } else {
            // subscription already exists, continue
            cb(null, topicArn);
        }
    });
}

/**
 * Create a topic.
 */
function createTopic(topicName, cb) {
    SNS.createTopic({ Name: topicName }, (err, data) => {
        if (err) {
            console.log('Creating topic failed.', err);
            return cb(err);
        }
        const topicArn = data.TopicArn;
        console.log(`Created topic: ${topicArn}`);
        console.log('Creating subscriptions.');
        createSubscription(topicArn, (subscribeErr) => {
            if (subscribeErr) {
                return cb(subscribeErr);
            }
            // everything is good
            console.log('Topic setup complete.');
            cb(null, topicArn);
        });
    });
}

function publish (event, context, callback){
    const number = event.body.sim.msisdn;

    console.log('Received event:', number);
    // create/get topic

    createTopic('td-ussd-sns-topic', (err, topicArn) => {
        if (err) {
            console.log(err);
            return callback(err);
        }
        console.log(`Publishing to topic ${topicArn}`);
        // publish message
        const params = {
            Message: `${event.body.sim.id} -- processed by Lambda\nPayload: ${JSON.stringify(event.body)}`,
            Subject: `Message received from ${number}: Add customer name`,
            TopicArn: topicArn,
        };
        // result will go to function callback
        SNS.publish(params, callback);
    });
};


// Creating a queue.
function CreateQueue(queuename){
    const params = {
        QueueName: queuename
    };

    return sqs.createQueue(params).promise()
};

// Listing our queues.
function listQueue() {
    return sqs.listQueues().promise();
}

// Sending a message.
// NOTE: Here we need to populate the queue url you want to send to.
// That variable is indicated at the top of app.js.
 function sendtoQueue(queueUrl, payload) {
    const params = {
        MessageBody: payload,
        QueueUrl: queueUrl,
        DelaySeconds: 0
    };
    return sqs.sendMessage(params).promise()
};

// Receive a message.
// NOTE: This is a great long polling example. You would want to perform
// this action on some sort of job server so that you can process these
// records. In this example I'm just showing you how to make the call.
// It will then put the message "in flight" and I won't be able to
// reach that message again until that visibility timeout is done.
 function receive() {
    var params = {
        QueueUrl: queueUrl,
        VisibilityTimeout: 600 // 10 min wait time for anyone else to process.
    };
    return sqs.receiveMessage(params).promise()
};

// Deleting a message.
function deleteMessage() {
    var params = {
        QueueUrl: queueUrl,
        ReceiptHandle: receipt
    };
    return sqs.deleteMessage(params).promise()
};

// Purging the entire queue.
function purge() {
    var params = {
        QueueUrl: queueUrl
    };
    sqs.purgeQueue(params).promise()
};

/*
params object
prop iot_number: 'adfafafasdfsa'
prop phone_number: '2423423423424'
return Object
 */
function getCustomerDetails(params, type){
    if(type && type === 'local'){
        //return promise with outlet data from fixtures
        return new Promise((resolve, reject) => {
            try {
                const customer = require('./fixtures/customer.json');
                resolve(customer);
            } catch(e){
                console.log(e); //log to cloudwatch events
                reject(e);
            }

        })
    } else {
        let endpoint = apiUrl;
        Object.keys(params).map(function(objectKey, index) {
            const queryParams = `&${objectKey}=${params[objectKey]}`;  //adding & for additional query params
            endpoint += queryParams;
        });

        console.log(`generated endpoint is ${endpoint}`);

        return rp(endpoint);
    }


}