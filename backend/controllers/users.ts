import { Response, Request, NextFunction } from 'express'
import { ParamsDictionary, Query } from 'express-serve-static-core';
import JWT from 'jsonwebtoken';
import UserModel, { User, UserBody } from '../models/user.model'
import ProjectModel from '../models/project.model'
import dotenv from 'dotenv';
import InstrumentModel from '../models/instrument.model'
import EffectModel from '../models/effect.model';
import { OAuth2Client } from 'google-auth-library';
import { messages } from '../helpers/routeHelpers'
dotenv.config()

type userRequest = Request<ParamsDictionary, User, any, Query>
type userBodyRequest = Request<ParamsDictionary, any, UserBody, Query>

const client = new OAuth2Client(process.env.CLIENT_ID);

export interface JWTToken {
    iss: string,
    sub: string,
    iat: Date,
    exp: Date,
}

const signToken = (user: { _id: string }): string => {
    const token = JWT.sign({
        iss: 'xolombrisx',
        sub: user._id,
        iat: new Date().getTime(),
        exp: new Date().setDate(new Date().getDay() + 1),
    }, process.env.JWT_AUTHORIZATION);
    return token
}

export async function signUp(req: userBodyRequest, res: Response): Promise<void> {
    try {
        if (req.body.username) {
            console.log('signing up');
            // if (req.value) {
            // const { username, email, firstName, lastName, password, method } = { ...req.value }
            const { username, email, firstName, lastName, password, method } = { ...req.body }
            const existence = await UserModel.findOne({ email: email, username: username }).exec();
            if (!existence) {
                const newUser = new UserModel({ username, email, firstName, lastName, local: { password }, method })
                newUser.save()
                    .then((user) => { res.status(200).json({ token: signToken(user) }) })
                    .catch((err) => { res.send(err) })
            } else
                res.status(403).send({ error: messages.USER_ALREADY_EXISTS });
        } else {
            res.status(403).send({ error: messages.DATA_VALIDATION_ERROR });
        }
    } catch (err) {
        res.status(403).send(err);
    }
};

export async function signIn(req: userRequest, res: Response, next: NextFunction): Promise<void> {
    if (req.user) {
        const token = signToken(req.user)
        res.status(200).json({ token })
        next()
    } else {
        res.status(200).json('nouser');
    }

}

export async function update(req: userBodyRequest, _res: Response): Promise<void> {
    // const { username, email, firstName, lastName } = { ...req.value }
    const { username, email, firstName, lastName } = { ...req.body }
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


export async function deleteUser(
    req: userBodyRequest,
    res: Response,
): Promise<void> {
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
        res.status(200).json({ message: messages.USER_DELETED });
    } else {
        res.status(200).json({ error: messages.UNKOWN_USER });
    }
}

export async function getProjects(
    _req: Request,
    res: Response
): Promise<void> {
    console.log('rolou')
    console.log('memo');
    res.status(200).json({ message: 'tatenu' });
};

export async function google(
    req: userBodyRequest,
    res: Response
): Promise<void> {
    const tokenId = req.body.token
    // const access = req.body.access
    const googleId = req.body.id
    // const TokenInfo = await client.getTokenInfo(tokenId)
    // const TokenInfo = await client.getTokenInfo(access)
    // console.log('tokenid', tokenId, 'tokenInfo', TokenInfo, 'id', googleId)
    client.verifyIdToken({ idToken: tokenId, audience: process.env.CLIENT_ID })
        .then(
            async (response) => {
                try {
                    const payload = response.getAttributes().payload
                    // console.log('verifying token, payload', payload)
                    // console.log('user id', TokenInfo.user_id)
                    if (payload) {
                        const { email_verified, family_name, given_name, email } = payload
                        if (email_verified && googleId) {
                            const existingUser = await UserModel.findOne({
                                email: email,
                                google: {
                                    id: googleId,
                                }
                            });
                            if (existingUser) {
                                const token = signToken(existingUser)
                                res.status(200).json({ token });
                            } else {
                                const newUser = new UserModel({
                                    method: 'google',
                                    email: email,
                                    google: {
                                        id: googleId,
                                    },
                                    firstName: family_name,
                                    lastName: given_name,
                                });
                                await newUser.save().then((user) => {
                                    const token = signToken(user)
                                    res.status(200).json({ token });
                                });
                            }
                        } else {
                            res.status(203).send(messages.NO_EMAIL_VERIFIED)
                        }
                    } else {
                        res.status(203).send(messages.UNKOWN_USER)
                    }
                } catch (error) {
                    res.status(203).json(error)
                }
            }
        )
}