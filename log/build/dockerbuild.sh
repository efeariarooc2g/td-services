# Switch Dockerfile for local builds
rm -rf ../app/Dockerfile
cp ../config/development/Dockerfile ../app/Dockerfile

# Retrieve service name from service root
cd ..
servname=${PWD##*/}
dimage="tradedepot/$servname"
echo "Building docker image $dimage..."
docker build -t $dimage ./app

# Replace production dockerfile
cd build
cp ../config/production/Dockerfile ../app/Dockerfile