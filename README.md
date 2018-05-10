# Clarity Media Server

A Media Server built using NodeJS. This is a still a **heavy** work in progress, and a lot of features haven't been implemented yet.

Currently Supports:
 - Directly playing MP4 files to the browser
 - Reading filenames and fetching metadata from TMDb

To Work On:
 - Support transcoding
 - Better config file, preferably JSON
 - Edit page
 - Settings page
 - Polishing, prettifying.
 - Clean up code

# Getting Started
The config file that contains TMDb api key, and required folders is not included (currently).
In the meantime, you'll need to create a file named "config.js" in the project's root directory. Example of what this would contain:

    var config = {}
    config.port = 3000
    config.tmdbApiKey = 'your TMDb api key'
    config.posterDirectory = 'where the posters (any image fetched) will be stored'
    config.mediaDirectory = 'where your video files are'
	module.exports = config

Next you'll need to install the dependencies (In the root directory):
    `npm install`

Then to start the server: `node ./server.js`


## Images
Home Page
![alt text](https://raw.githubusercontent.com/nomad23541/clarity-media-server/master/screenshots/screen-0.png)
Details Page
![alt text](https://raw.githubusercontent.com/nomad23541/clarity-media-server/master/screenshots/screen-1.png)
