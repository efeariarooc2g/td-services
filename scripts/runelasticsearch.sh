# Pull the official elasticsearch image and run it. It will fail if container elasticsearch already exists
docker run --net=td_bridge -d -p 9200:9200 -p 9300:9300 --name elasticsearch elasticsearch