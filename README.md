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

This project uses MongoDB as it's database, that will need to be setup on localhost.
You can install MongoDB using my script `install.sh' (I don't recommend, you should probably install it via your package manager)

Next you'll need to install the dependencies (In the root directory):
    `npm install`

Then to start the server: `npm start`
Or you can run it using: `start.sh`, this helps with mongod already running if you're restarting the app.

NOTE: Until further notice, you'll need your own TMDb API Key (https://developers.themoviedb.org/3/getting-started/introduction)
This is planned to become optional


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
