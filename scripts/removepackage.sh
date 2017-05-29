# Check for required package to add
if [ "$#" -ne 1 ]; then
    echo "Please specify the correct parameter for the required meteor package to add"
    echo "Correct syntax: ./removepackage.sh <package name>"
    exit 1
fi

DIR="$( cd "$( dirname "$0" )" && pwd )"
cd $DIR/..

# Loop through all service directories and add clustering
for d in */ ; do
    cd $d
	if [ "${PWD##*/}" != "scripts" ]; then
		echo "Removing $1 from ${PWD##*/}..."
		cd app
		iron remove $1
		cd ../..
	else
		cd ..
	fi
done