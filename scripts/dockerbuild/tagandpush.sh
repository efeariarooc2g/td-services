# Initialize tag with circle build num
if [ ! $CI ]; then
	tag="localbuild"
else
	tag="$CIRCLE_BRANCH-$CIRCLE_BUILD_NUM"
fi

# Loop through all td images, tag and push
for i in `docker ps -aq` ; do
	image=`docker inspect --format="{{ .Config.Image }}" $i`
	imageid=`docker inspect --format="{{ .Image }}" $i`
	if [[ $image == tradedepot* ]]; then
		echo Tagging $image...
		echo docker tag $imageid $image:$tag
		docker tag $imageid $image:$tag
		if [ $CI ]; then
			docker push $image:$tag
		fi
	fi
done