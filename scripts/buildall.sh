DIR="$( cd "$( dirname "$0" )" && pwd )"
cd $DIR/..

buildfile="prod.sh"

# Always build from prod build
#if [[ "$1" == "master"* ]]; then
#    buildfile="prod.sh"
#fi

# Loop through all service directories and build docker images for each
for d in */ ; do
	if [ -d "$d/build" ]; then
		echo "Building service $d..."
		cd $d
		
		# proceed to build
		cd build
		
		# copy in the build script -> delete first if already existing
		if [ -e dockerbuild.sh ]; then
			echo "Deleting build file relic..."
			rm -rf dockerbuild.sh
		fi

		cp $DIR/dockerbuild/$buildfile ./dockerbuild.sh
		chmod +x dockerbuild.sh
		./dockerbuild.sh

		# done, remove build script copy
		rm -rf dockerbuild.sh

		cd ../..
	fi
done