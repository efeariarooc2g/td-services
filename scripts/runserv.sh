# Check for required meteor microservice container image name and port no
if [ "$#" -lt 2 ]; then
    echo "Please specify the correct parameters for microservice name and port no"
    echo "Correct syntax: $0 <service name> <port no> [<docker host>]"
    exit 1
fi

dimage="tradedepot/$1"
dockerhost="http://localhost"

if [ "$#" -gt 2 ]; then
    dockerhost="http://$3"
fi

# Set elasticurl and rabbiturl dynamically...docker-based for non-circle deployments
elasticurl="http://localhost:9200"
rabbiturl="amqp://localhost:5672"
redishost="localhost"
redisport="6379"
if [ ! $CI ]; then
    if [ "$#" -gt 2 ]; then
        elasticurl="http://$3:9200"
        rabbiturl="amqp://localhost"
        redishost="$3"
    fi
fi

mongourl="mongodb://mongodb:27017"
mailurl=""
senderemail="notifications@tradedepot.co"
mailsender="TradeDepot Notifications <notifications@tradedepot.co>"
s3bucket="tdcdocuments"

# Run the docker container. For this to work, ensure you have the mongo container running with runmongo.sh
docker run -d \
    -e ROOT_URL=$dockerhost:$2 \
    -e MONGO_URL=$mongourl/tradedepot \
    -e SEARCH_MONGO_URL=$mongourl/tradedepot \
    -e SEARCH_ELASTIC_URL=$elasticurl \
    -e RABBIT_URL=$rabbiturl \
    -e REDIS_HOST=$redishost \
    -e REDIS_PORT=$redisport \
    -e MAIL_URL=$mailurl \
    -e SENDER_EMAIL="$senderemail" \
    -e MAIL_SENDER="$mailsender" \
    -e AWS_S3_BUCKET=$s3bucket \
    --net=td_bridge \
    --name=$1 \
    -p $2:3000 \
    $dimage 
    
    