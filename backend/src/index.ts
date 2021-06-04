import '../config/passport';
import express from 'express';
import cors from 'cors';
import userRouter from '../routes/users';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import passport from 'passport';
import _session from 'express-session';

// loads enviroment variables from a env file into process
dotenv.config();

console.log('locura tio');

const app = express();
const port = process.env.PORT || 5000

// Middlewares
app.use(cors());
app.use(express.json());
app.use(bodyParser.json())
app.use(passport.initialize())

// Routes
app.use('/users', userRouter);


// server connection
const uri = process.env.ATLAS_URI;

mongoose.connect(uri, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const connection = mongoose.connection;
connection.once('open', () => {
    console.log('MONGODB database conneciton established ');
})


app.listen(port);

