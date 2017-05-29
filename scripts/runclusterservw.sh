# Check for required meteor microservice container image name and port no
if [ "$#" -lt 3 ]; then
    echo "Please specify the correct parameters for microservice name, port no and number of workers"
    echo "Correct syntax: $0 <service name> <port no> <worker count> [<docker host>]"
    exit 1
fi

dimage="tradedepot/$1"
dockerhost="http://localhost"

if [ "$#" -gt 3 ]; then
    dockerhost="http://$4"
fi

# Set elasticurl dynamically...docker-based for non-circle deployments
elasticurl="http://localhost:9200"
rabbiturl="amqp://localhost:5672"
redishost="localhost"
redisport="6379"
if [ ! $CI ]; then
    elasticurl="elasticsearch://elasticsearch:9200"
    rabbiturl="amqp://localhost"
        
    if [ "$#" -gt 3 ]; then
        elasticurl="http://$4:9200"
        redishost="$4"
    fi
fi


mongourl="mongodb://mongodb:27017"
s3bucket="tdcdocuments"

# Run the docker container. For this to work, ensure you have the mongo container running with runmongo.sh
docker run -d \
    -e ROOT_URL=$dockerhost:$2 \
    -e MONGO_URL=$mongourl/tradedepot \
    -e SEARCH_MONGO_URL=$mongourl/tradedepot \
    -e SEARCH_ELASTIC_URL=$elasticurl \
    -e CLUSTER_DISCOVERY_URL=$mongourl/cluster \
    -e CLUSTER_SERVICE=$1 \
    -e CLUSTER_WORKERS_COUNT=$3 \
    -e CLUSTER_PUBLIC_SERVICES="main, search, notification" \
    -e RABBIT_URL=$rabbiturl \
    -e REDIS_HOST=$redishost \
    -e REDIS_PORT=$redisport \
    -e AWS_S3_BUCKET=$s3bucket \
    --net=td_bridge \
    --name=$1 \
    -p $2:3000 \
    $dimage 
    
    