#!/bin/bash

# Get the pid from the pid file
PID=$(cat pocketbase/pocketbase.pid)

# Kill the PocketBase process
kill $PID

# Remove the pid file & pb_data directory & pocketbase executable
rm pocketbase/pocketbase.pid
