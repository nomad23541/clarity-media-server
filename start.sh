#!/bin/bash
# This is used for my development env
# Will shutdown mongod if it is already running, then start program
# which then starts mongod

# check if mongod is running
ps cax | grep mongod > /dev/null
if [ $? -eq 0 ]; then
    echo "Mongod is running, shutting down, then continuing with start..."
    mongod --dbpath data --shutdown
fi  

# now start
npm start