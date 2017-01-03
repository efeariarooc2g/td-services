

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



import AWS from 'aws-sdk';
import rp from 'request-promise'

export function processRequest(event, context, callback) {
    //handle only post request
    let responseCode = 200;
    const responseBody = {
        message: "Ussd request received"
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
            publish(event, context, callback);
            context.succeed(response);
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
}

const EMAIL = 'mocheje@c2gconsulting.com';  // TODO change me
const SNS = new AWS.SNS({ apiVersion: '2010-03-31' });


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
 *
 * A "LONG" clickType is sent if the first press lasts longer than 1.5 seconds.
 * "SINGLE" and "DOUBLE" clickType payloads are sent for short clicks.
 *
 * For more documentation, follow the link below.
 * http://docs.aws.amazon.com/iot/latest/developerguide/iot-lambda-rule.html
 */
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
