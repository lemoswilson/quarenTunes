import passport from 'passport';
import LocalStrategy from 'passport-local';
import JWTStrategy, { ExtractJwt } from 'passport-jwt';
import UserModel from '../models/user.model';
import { comparePassword } from '../models/user.model'
import { JWTToken } from '../controllers/users';
import dotenv from 'dotenv'
import { messages } from '../helpers/routeHelpers'

dotenv.config()
passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

// in order to get authorization to login, 
// we'll need a header with a signed JWT

async function JSTStrat(
    payload: JWTToken,
    done: JWTStrategy.VerifiedCallback
): Promise<void> {
    try {
        const user = await UserModel.findById(payload.sub);
        if (!user) return done(null, false);
        done(null, user);
    } catch (error) {
        done(error, false);
    }
}

passport.use('jwt', new JWTStrategy.Strategy({
    jwtFromRequest: ExtractJwt.fromHeader('authorization'),
    secretOrKey: process.env.JWT_AUTHORIZATION,
}, JSTStrat))

passport.use('local', new LocalStrategy.Strategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: false,
}, async (
    username,
    password,
    done
): Promise<void> => {
    try {
        const user = await UserModel.findOne({ username: username }).exec()
        if (!user) return done(null, false, { message: messages.UNKOWN_USER_PASS });
        if (user.local?.password) {
            if (await comparePassword(password, user.local.password))
                return done(null, user)

            else 
                return done(null, false, { message: messages.UNKOWN_USER_PASS })
            
        } else {
            return done(null, false, { message: messages.CREATED_GOOGLE });
        }
    } catch (error) {
        return done(error, false)
    }
}))
