# XolombrisX
[![NPM](https://img.shields.io/npm/l/react)](https://github.com/lemoswilson/quarenTunes/blob/typescript-redux/LICENSE.md) 

## About
XolombrisX is a full-stack web application that allows users to create simple beats by sequencing a few digital instruments in the browser. The users can save their beats by first creating an account. As of August 2021, the application is for desktop chrome only.

## Layout

<p float="left">
	<img src="https://i.imgur.com/xoKD2ZU.png" width="47%" height="47%">
	<img src="https://i.imgur.com/aV0xRmE.png" width="47%" height="47%">
</p>

<p float="center">
	<img src="https://i.imgur.com/V6Iv18h.png" width="47%" height="47%">
</p>


## Tech Stack
### Backend
- NodeJS
- ExpressJS
- MongoDB 
- Typescript
- PassportJS

### Frontend
- HTML / SCSS / TypesScript
- React
- Redux
- ToneJS

## Production
- Backend: Heroku
- Frontend: Netlify
- Database: MongoDB Atlas

## How to run the app
### Backend
```
# clone repo
git clone https://github.com/lemoswilson/quarentunesBackend

# change dir to backend
cd backend

# install dependencies
npm install

# set environment variables
# create .env file and set your credentials for ATLAS_URI, Google OAuth, as well as a JWT Authorization, and a URL for the frontend.
ATLAS_URI=<Your Atlas URI>
CLIENT_SECRET=<Your Google Client Secret>
CLIENT_ID=<Your Google Client ID> 
JWT_AUTHORIZATION=<Your JWT Authorization key>
REACT_APP_URL=<The URL for the frontend> 

# compile typescript 
tsc -w

# run code
node dist/src/index.js
```

### Frontend
```
# clone repo
git clone https://github.com/lemoswilson/quarenTunes

# cd to the folder where you cloned the repo
cd 'path/to/repo'

# install dependencies
npm install

# set environment variables
# create .env file and set the url for the server
REACT_APP_SERVER_URL=<SERVER URL>

# run the project
npm start
```

# Author

Wilson Lemos

https://lemoswilson.com