# This .sh file will be sourced before starting your application.
# You can use it to put environment variables you want accessible
# to the server side of your app by using process.env.MY_VAR
#
# Example:
# export MONGO_URL="mongodb://localhost:27017/myapp-development"
# export ROOT_URL="http://localhost:3000"

export CLUSTER_DISCOVERY_URL="mongodb://localhost/discovery"

# Register a service to the cluster
export CLUSTER_SERVICE="log"
export CLUSTER_WORKERS_COUNT=20
export CLUSTER_PUBLIC_SERVICES="main, search"

# Other service parameters
export RABBIT_URL=""
export REDIS_HOST=""
export REDIS_PORT="6379"
export MP_POSTGRES="postgres://username:password@localhost/database"
