#!/usr/bin/env bash


# cluster env vars
export CLUSTER_DISCOVERY_URL="mongodb://localhost/service-discovery"
export CLUSTER_SERVICE="report"
export CLUSTER_PUBLIC_SERVICES="report"

# mongodb urls
export MONGO_URL="mongodb://localhost:27017/meteor"
# export MONGO_OPLOG_URL="mongodb://localhost:27017/meteor"
export DATA_MONGO_URL="mongodb://localhost:27017/meteor"
