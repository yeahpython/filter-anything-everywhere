set -e

BUILD_DIR="$( dirname -- "$0"; )/build"

if [ ! -d "$BUILD_DIR" ]; then
	# Not strictly necessary, just prefer that user does it
	echo "Please create a build directory at $BUILD_DIR."
	exit 1
fi

rm -r $BUILD_DIR/*

EXT_COPY=$BUILD_DIR/extension

rsync -ab --exclude *.ts --exclude .DS_Store extension/ $EXT_COPY

rollup -c

zip -r extension.zip $EXT_COPY
echo "The extension has been created at 'extension.zip'."