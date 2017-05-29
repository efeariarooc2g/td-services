# Check for required package to add
if [ "$#" -ne 1 ]; then
    echo "Please specify the correct parameter for the required meteor package to add"
    echo "Correct syntax: ./addpackage.sh <package name>"
    exit 1
fi

DIR="$( cd "$( dirname "$0" )" && pwd )"
cd $DIR/..

# Loop through all service directories and add clustering
for d in */ ; do
    cd $d
	if [ "${PWD##*/}" != "scripts" ]; then
		echo "Adding $1 to ${PWD##*/}..."
		cd app
		iron add $1
		cd ../..
	else
		cd ..
	fi
done