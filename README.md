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
In the meantime, you'll need to create a file named "config.json" in the project's root directory. This will change once I have implemented a "first-time setup" process. 

Example of what this would contain:
```json
    {
    	"port": "port you'd like to use",
	"posterDirectory": "where you'd like posters (and other images) to be stored",
	"mediaDirectory": "where all your media is",
	"tmdbApiKey": "your tmdb api key"
	"transcoding": {
		"crf": "20" <- crf is the quality of the transcoding with 0 being best and 50 being worst
	}
    }
```

Next you'll need to install the dependencies (In the root directory):
    `npm install`

Then to start the server: `node ./server.js`


## Images
Home Page
![alt text](https://raw.githubusercontent.com/nomad23541/clarity-media-server/master/screenshots/screen-0.png)
Details Page
![alt text](https://raw.githubusercontent.com/nomad23541/clarity-media-server/master/screenshots/screen-1.png)
