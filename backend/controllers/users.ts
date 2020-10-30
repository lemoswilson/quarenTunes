import { Response, Request, NextFunction } from 'express'
import { ParamsDictionary, Query } from 'express-serve-static-core';
import JWT from 'jsonwebtoken';
import UserModel, { User } from '../models/user.model'
import ProjectModel from '../models/project.model'
import InstrumentModel from '../models/instrument.model'
import EffectModel from '../models/effect.model';
import { JWT_SECRET } from '../config/token';
import { OAuth2Client } from 'google-auth-library';

type userRequest = Request<ParamsDictionary, User, any, Query>

const client = new OAuth2Client('860801707225-igbgn7p48ffqqu6mgfds39o4q7md2rvr.apps.googleusercontent.com');

export interface JWTToken {
    iss: string,
    sub: string,
    iat: Date,
    exp: Date,
}

const signToken = (user: { _id: string }) => {
    const token = JWT.sign({
        iss: 'xolombrisx',
        sub: user._id,
        iat: new Date().getTime(),
        exp: new Date().setDate(new Date().getDay() + 1),
    }, JWT_SECRET);
    return token
}

export async function signUp(req: userRequest, res: Response) {
    try {
        if (req.value) {
            console.log('signing up');
            const { username, email, firstName, lastName, password, method } = { ...req.value }
            const existence = await UserModel.findOne({ email: email, username: username }).exec();
            if (!existence) {
                const newUser = new UserModel({ username, email, firstName, lastName, local: { password }, method })
                newUser.save()
                    .then((user) => { res.status(200).json({ token: signToken(user) }) })
                    .catch((err) => { res.send(err) })
            } else
                res.status(403).send({ error: "User already exists" });
        } else {
            console.log('no value')
            res.status(403).send({ error: " no no no no no" });
        }
    } catch (err) {
        res.status(403).send(err);
    }
};

export async function signIn(req: userRequest, res: Response, next: NextFunction) {
    if (req.user) {
        const token = signToken(req.user)
        res.status(200).json({ token })
        next()
    } else {
        res.status(200).json('nouser');
    }

}

export async function update(req: userRequest, _res: Response) {
    const { username, email, firstName, lastName } = { ...req.value }
    UserModel.findOne({ username: username })
        .then(user => {
            if (user?.username && firstName && email && lastName && username) {
                user.username = username
                user.email = email
                user.firstName = firstName
                user.lastName = lastName
                user.save()
            }
        })
}

export async function google(req: Request, res: Response) {
    console.log('req.user', req.user);
    const token = signToken(req.user)
    res.status(200).json({ token })
}

export async function deleteD(
    req: userRequest,
    _res: Response,
) {
    const username = req.body.username;
    let id;
    UserModel.findOne({ username: username }).then(us => {
        if (us) {
            id = us._id;
            ProjectModel.deleteMany({ User: id })
            InstrumentModel.deleteMany({ User: id })
            EffectModel.deleteMany({ User: id })
        }
    })
    if (id) {
        UserModel.deleteOne({ username: username })
        _res.status(200).json({ message: 'username deleted' });
    } else {
        _res.status(200).json({ error: 'username not found' });
    }
}

export async function getProjects(
    _req: Request,
    res: Response
) {
    console.log('rolou')
    console.log('memo');
    res.status(200).json({ message: 'tatenu' });
};

export async function googleTwo(
    req: Request,
    res: Response
) {
    const tokenId = req.body.token
    const TokenInfo = await client.getTokenInfo(tokenId)
    client.verifyIdToken({ idToken: tokenId, audience: '860801707225-igbgn7p48ffqqu6mgfds39o4q7md2rvr.apps.googleusercontent.com' }).then(
        async (response) => {
            const payload = response.getAttributes().payload
            if (payload) {
                const { email_verified, family_name, given_name, email } = payload
                if (email_verified && TokenInfo.user_id) {
                    const existingUser = await UserModel.findOne({
                        email: email,
                        google: {
                            id: TokenInfo.user_id,
                        }
                    });
                    if (existingUser) {
                        // user already exists, return token
                        const token = signToken(existingUser)
                        res.status(200).send(token);
                    }
                    else {
                        // user does not exist, creating one
                        const newUser = new UserModel({
                            method: 'google',
                            email: email,
                            google: {
                                id: TokenInfo.user_id,
                            },
                            firstName: family_name,
                            lastName: given_name,
                        });
                        await newUser.save().then((user) => {
                            const token = signToken(user)
                            res.status(200).send(token)
                        });
                    }
                } else {
                    res.status(203).send('no user found')
                }
            } else {
                res.status(203).send('no user found')
            }
        }
    )
    console.log('tokenId')
}