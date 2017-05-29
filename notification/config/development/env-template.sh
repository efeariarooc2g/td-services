# This .sh file will be sourced before starting your application.
# You can use it to put environment variables you want accessible
# to the server side of your app by using process.env.MY_VAR
#
# Example:
# export MONGO_URL="mongodb://localhost:27017/myapp-development"
# export ROOT_URL="http://localhost:3000"
# export KADIRA_ID=""
# export KADIRA_SECRET=""


# aws env vars
export AWS_ACCESS_KEY_ID=""
export AWS_SECRET_ACCESS_KEY=""

# service env vars
export RABBIT_URL="amqp://localhost"

export MAIL_URL="smtp://tradepot:1ndieg0g0@smtp.sendgrid.net:587"
export SENDER_EMAIL="notifications@tradedepot.co"
export MAIL_SENDER="TradeDepot Notifications <notifications@tradedepot.co>"

export REDIS_HOST="127.0.0.1"
export REDIS_PORT="6379"
