import passport from 'passport';
import LocalStrategy from 'passport-local';
import JWTStrategy, { ExtractJwt } from 'passport-jwt';
import passportGoogle from 'passport-google-oauth20'
import User, { UserModelType } from '../models/user.model';
import { comparePassword } from '../models/user.model'
import { JWTToken } from '../controllers/users';
import { JWT_SECRET } from './token';

passport.serializeUser((user: UserModelType, done) => {
    done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id)
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

passport.use('jwt', new JWTStrategy.Strategy({
    jwtFromRequest: ExtractJwt.fromHeader('authorization'),
    secretOrKey: JWT_SECRET,
}, async (
    payload: JWTToken,
    done: JWTStrategy.VerifiedCallback
) => {
    try {
        const user = await User.findById(payload.sub);
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
        const user = await User.findOne({ username: username })
        if (!user) return done(null, false, { message: "Unknown User" });
        const isValid = await comparePassword(password, user.password);
        if (isValid) return done(null, user)
        else return done(null, false, { message: 'Unknown password' })
    } catch (error) {
        return done(error, false)
    }
}))

passport.use('google', new passportGoogle.Strategy({
    clientID: '860801707225-igbgn7p48ffqqu6mgfds39o4q7md2rvr.apps.googleusercontent.com',
    clientSecret: 'Vyi80tfHhUqC_WJg-H8-RpWW',
    callbackURL: ''
}, async (
    accessToken,
    refreshToken,
    profile,
    cb
) => {
    try {
        accessToken;
        refreshToken;

        return cb(undefined, profile);
    } catch (error) {

    }
}))

// export default 