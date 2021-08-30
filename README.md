# XolombrisX

## About
XolombrisX is a full-stack web application that allows the user to create simple beats by sequencing a few digital instruments in the browser. The user can save his beats by first creating an account. As of August 2021, the application is for desktop chrome only.

## Layout
![Layout](https://i.imgur.com/xoKD2ZU.png)

<img src="https://i.imgur.com/xoKD2ZU.png" width="80%" height="80%">


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
git clone https://github.com/lemoswilson/quarenTunes

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