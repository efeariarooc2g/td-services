# ORDER-TRIGGER
> AWS Lambda function that will receive an authorized request from (iot device, ussd) and process the action based on custormer request

* node ^4.x.x
* ES6 codebase
* modular, testable, functional and importantly readable codebase 

## Usage

Download the [`/dist/build.zip`](https://github.com/tradedepot/td-services/tree/ussd-resolver/order-trigger/dist/build.zip) file from the latest release and deploy it as a lambda function.

Build

	$ npm install -g ava-cli gulp-cli
	$ cd '/applicationFolder'
	$ ava (run test)
	$ gulp build (build project)

Lambda settings:

* **Function Name** specify lambda function name
* **Timeout** 30 seconds or above
* **Runtime** Node.js 4.3 and above
* **Handler** index.ProcessRequest (this function processes authorized request from ussd or customer devices)
* **Event Sources** AWS API GATEWAY / AWS IOT GATEWAY

### IAM Role

Make sure your lambda function is able to use SNS for sending notification.

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "sns:ListSubscriptionsByTopic",
                "sns:CreateTopic",
                "sns:SetTopicAttributes",
                "sns:Subscribe",
                "sns:Publish"
            ],
            "Resource": "*"
        }
    ]
}
```

## License

MIT © C2GCONSULTING
