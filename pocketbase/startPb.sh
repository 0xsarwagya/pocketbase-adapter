#!/bin/bash

# Set default values if environment variables are not already set
TARGETOS=${TARGETOS:-$(uname | tr '[:upper:]' '[:lower:]')}
TARGETARCH=${TARGETARCH:-$(uname -m)}
TARGETVARIANT=""

# Remove pb_data directory if it exists
if [ -d "pocketbase/pb_data" ]; then
	rm -rf pocketbase/pb_data
fi

# Remove the pocketbase executable if it exists
if [ -f "pocketbase/pocketbase" ]; then
	rm pocketbase/pocketbase
fi

# Install unzip and wget if they are not already installed based on the OS
if [[ "$TARGETOS" == "linux" ]]; then
	if ! command -v unzip &>/dev/null; then
		apt-get update
		apt-get install -y unzip
	fi
	if ! command -v wget &>/dev/null; then
		apt-get update
		apt-get install -y wget
	fi
elif [[ "$TARGETOS" == "darwin" ]]; then
	if ! command -v unzip &>/dev/null; then
		brew install unzip
	fi
	if ! command -v wget &>/dev/null; then
		brew install wget
	fi
fi

# Specify PocketBase version
VERSION=${VERSION:-0.22.20}

# Set architecture based on uname output for the GitHub Action runner
if [[ "$TARGETARCH" == "x86_64" ]]; then
	TARGETARCH="amd64"
elif [[ "$TARGETARCH" == "aarch64" ]]; then
	TARGETARCH="arm64"
fi

# Construct the URL for downloading PocketBase
BUILDX_ARCH="${TARGETOS}_${TARGETARCH}${TARGETVARIANT}"
POCKETBASE_URL="https://github.com/pocketbase/pocketbase/releases/download/v${VERSION}/pocketbase_${VERSION}_${BUILDX_ARCH}.zip"

# Download and unzip PocketBase
echo "Downloading PocketBase from ${POCKETBASE_URL}"
wget $POCKETBASE_URL -O pocketbase/pocketbase.zip
unzip pocketbase/pocketbase.zip -d pocketbase
chmod +x pocketbase/pocketbase

# Remove ChangeLog and LICENSE files
rm pocketbase/CHANGELOG.md pocketbase/LICENSE pocketbase/LICENSE.md pocketbase/pocketbase.zip

# Ensure pb_migrations exists; if not, exit with an error
if [ ! -d "pocketbase/pb_migrations" ]; then
	echo "Error: pocketbase/pb_migrations directory not found. Please ensure the directory exists."
	exit 1
fi

# Start PocketBase using the absolute paths for directories and export pid to a file
./pocketbase/pocketbase serve --http=0.0.0.0:8090 --migrationsDir=$(pwd)/pocketbase/pb_migrations --dir=$(pwd)/pocketbase/pb_data --automigrate=false &
echo $! >pocketbase/pocketbase.pid && echo "PocketBase started successfully"
