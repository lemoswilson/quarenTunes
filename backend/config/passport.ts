import passport from 'passport';
import LocalStrategy from 'passport-local';
import JWTStrategy, { ExtractJwt } from 'passport-jwt';
import passportGoogle from 'passport-google-oauth'
import UserModel from '../models/user.model';
import { comparePassword } from '../models/user.model'
import { JWTToken } from '../controllers/users';
import { JWT_SECRET } from './token';

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

// in order to get authorization to login, 
// we'll need a header with a signed JWT

passport.use('jwt', new JWTStrategy.Strategy({
    jwtFromRequest: ExtractJwt.fromHeader('authorization'),
    secretOrKey: JWT_SECRET,
}, async (
    payload: JWTToken,
    done: JWTStrategy.VerifiedCallback
) => {
    try {
        const user = await UserModel.findById(payload.sub);
        if (!user) return done(null, false);
        done(null, user);
    } catch (error) {
        done(error, false);
    }
}))

passport.use('local', new LocalStrategy.Strategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: false,
}, async (
    username,
    password,
    done
) => {
    try {
        const user = await UserModel.findOne({ username: username })
        if (!user) return done(null, false, { message: "Unknown User" });
        if (user.local?.password) {
            const isValid = await comparePassword(password, user.local.password);
            if (isValid) return done(null, user)
            else return done(null, false, { message: 'Unknown password ' })
        } else {
            return done(null, false, { message: 'Account created via Google, first create a password' });
        }
    } catch (error) {
        return done(error, false)
    }
}))

passport.use('google', new passportGoogle.OAuth2Strategy({
    clientID: '860801707225-igbgn7p48ffqqu6mgfds39o4q7md2rvr.apps.googleusercontent.com',
    clientSecret: 'Vyi80tfHhUqC_WJg-H8-RpWW',
    callbackURL: 'http://localhost:5000/users/auth/google/callback'
}, async (
    accessToken,
    refreshToken,
    profile,
    cb
) => {
    try {
        if (profile.emails) {
            const existingUser = await UserModel.findOne({
                email: profile.emails[0].value,
                google: {
                    id: profile.id,
                }
            });
            if (existingUser) {
                console.log('user already exists');
                return cb(undefined, existingUser);
            }
            else {
                console.log('user does not exist')
                if (profile.emails && profile.name) {
                    const newUser = new UserModel({
                        method: 'google',
                        email: profile.emails[0].value,
                        google: {
                            id: profile.id,
                        },
                        firstName: profile.name.givenName,
                        lastName: profile.name.familyName,
                    });
                    await newUser.save();
                    return cb(undefined, newUser);
                }
            }
        }
        return cb(undefined, profile);
    } catch (error) {
        cb(error, undefined, error.message);
    }
}))
