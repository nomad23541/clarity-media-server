# Clarity Media Server

A Media Server built using NodeJS. This is a still a **heavy** work in progress, and a lot of features haven't been implemented yet.

Features:
 - Directly playing MP4 files to the browser
 - Transcoding non MP4 files (mkv only one tested) to browser
 - Processing metadata for shows and movies from TMDb (requires API key)
 - Manual metadata fixing

To Work On:
 - Better transcoding configuration
 - Optimal transcoding on mobile devices
 - Optimal transcoding on desktop devices

# Getting Started
The config file that contains TMDb api key, and required folders is not included (currently).
In the meantime, you'll need to create a file named "config.json" in the project's root directory. This will change once I have implemented a "first-time setup" process. 

Example of what this would contain:
```json
    {
    	"port": "port you'd like to use",
	"imagesDirectory": "where you'd like images to be stored",
	"moviesDirectory": "where all your movies are",
	"showsDirectory": "where your shows are",
	"tmdbApiKey": "your tmdb api key",
	"transcoding": {
		"crf": "20 (crf is quality, 0 best, 50 worst)",
		"preset": "veryfast (check ffmpeg docs for preset values)",
		"normalizeAudio": "true (takes boolean value, does what it implies)"
	}
    }
```
This project uses MongoDB as it's database, that will need to be setup on localhost (I will later on include an install script that will do this automatically).

Next you'll need to install the dependencies (In the root directory):
    `npm install`

Then to start the server: `node ./server.js`


## Images
Home Page/Library Page
![alt text](https://raw.githubusercontent.com/nomad23541/clarity-media-server/master/screenshots/screenshot-library.png)
Movies
![alt text](https://raw.githubusercontent.com/nomad23541/clarity-media-server/master/screenshots/screenshot-movies.png)
Movie Details
![alt text](https://raw.githubusercontent.com/nomad23541/clarity-media-server/master/screenshots/screenshot-movie-details.png)
Show
![alt text](https://raw.githubusercontent.com/nomad23541/clarity-media-server/master/screenshots/screenshot-show.png)
Show Season
![alt text](https://raw.githubusercontent.com/nomad23541/clarity-media-server/master/screenshots/screenshot-season.png)
