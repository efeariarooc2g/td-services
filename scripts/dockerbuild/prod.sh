# Switch Dockerfile for local builds
rm -rf ../app/Dockerfile
cp ../config/production/Dockerfile ../app/Dockerfile

# Retrieve service name from service root
cd ..
servname=${PWD##*/}
dimage="tradedepot/$servname"
echo "Building docker image $dimage..."

docker build -t $dimage ./app


cd build
