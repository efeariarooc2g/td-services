#
# utility to ensure install tradedepot:* packages
# packages are cloned, or pulled to env PACKAGE_DIRS
#
# Use:
# ./clonepackages.sh
#
# set default meteor packages dir to tmp
DIR="$( cd "$( dirname "$0" )" && pwd )"
cd $DIR/..

export PACKAGE_DIRS="$PWD/../packages"
echo "PACKAGE_DIRS="$PACKAGE_DIRS

# we'll clone to the package dir
PKGDST=$PACKAGE_DIRS
set -u
set -e

# ensure repos not cached by using .meteor folder
mkdir -p $PKGDST

echo "*****************************************************************"
echo "checking the default branches for tradedepot:* packages    "
echo "*****************************************************************"
# loop through packages file and get the tradedepot package repos
grep "tradedepot:" main/app/.meteor/versions|while read PACKAGE; do
  PACKAGE=$(echo $PACKAGE | sed -e 's/@.*//')
  
  echo "fetching meteor package info ---> " $PACKAGE

  REPO=$(meteor show $PACKAGE --show-all |grep 'Git: ' | sed -e 's/Git: //g')
  FOLDER=$(echo $PACKAGE | sed -e 's/tradedepot://g')
  if [ -n "$PACKAGE" ]; then
    # if not already checked out, clone repo
    if [ ! -d "$PKGDST/$FOLDER" ]; then
     echo "Git clone: " $PACKAGE " @ " $REPO " TO " $PKGDST/$FOLDER
     git clone $REPO $PKGDST/$FOLDER
    else
      # already cloned, pull to update
     echo "Git pull: " $PACKAGE " IN" $PKGDST/$FOLDER
     git -C $PKGDST/$FOLDER pull
    fi
  fi
done

# finish with feedback
echo "*****************************************************************"
echo "tradedepot:* packages updated in " $PACKAGE_DIRS
echo "use: export PACKAGE_DIRS="$PACKAGE_DIRS""
echo "*****************************************************************"
export PACKAGE_DIRSS=$PACKAGE_DIRS

exit
