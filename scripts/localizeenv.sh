DIR="$( cd "$( dirname "$0" )" && pwd )"
cd $DIR/..


# Loop through all service directories and build docker images for each
for d in */ ; do
	if [ -d "$d/config" ]; then
		cd $d
		cd config
		
		# copy in the build script -> delete first if already existing
		if [ -d development ]; then
			if [ -e "development/env-template.sh" ]; then
				if [ ! -e "development/env.sh" ]; then
					echo "Localizing for service $d..."
					cp development/env-template.sh development/env.sh
				fi
			fi
		fi

		cd ../..
	fi
done