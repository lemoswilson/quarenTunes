import { Response, Request } from 'express'
import { ParamsDictionary, Query } from 'express-serve-static-core';
import { OAuth2Client } from 'google-auth-library';
import JWT from 'jsonwebtoken';
import dotenv from 'dotenv';

import UserModel, { User, UserBody, UserModelType } from '../models/user.model'
import UserRecoverModel from '../models/userRecover.model';
import ProjectModel from '../models/project.model'
import InstrumentModel from '../models/instrument.model'
import EffectModel from '../models/effect.model';

import { makeid, messages } from '../helpers/routeHelpers'
import transport, { options } from '../src/mailer';

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
        exp: new Date().setDate(new Date().getDate() + 1),
    }, process.env.JWT_AUTHORIZATION);
    return token
}


export async function verify(req: Request<any>, res: Response<any>): Promise<void> {
    try { 
        if (!req.user){
            res.status(202).json({data: 'invalid or expired token'})
        }
        else 
            res.status(200).send({data: true})
        
    } catch(e) {
        res.status(403).send(e);
    }
}

export async function signUp(req: userBodyRequest, res: Response): Promise<void> {
    try {
        if (req.body.username) {
            const { username, email, password, method } = { ...req.body }
            const existence = await UserModel.findOne({ username: username }).exec();
            const mailExistence = await UserModel.findOne({ email: email }).exec();

            if (!existence && !mailExistence) {
                const newUser = new UserModel({ username, email, local: { password }, method })
                newUser.save()
                    .then((user) => { res.status(200).json({ token: signToken(user._id) }) })
                    .catch((err) => { res.send(err) })

            } else if (existence) {
                res.status(202).send({ error: messages.USER_ALREADY_EXISTS });
            } else 
                res.status(202).send({ error: messages.EMAIL_EXISTS}) 

        } else {
            res.status(403).send({ error: messages.DATA_VALIDATION_ERROR });
        }
    } catch (err) {
        res.status(403).send(err);
    }
};

export async function signIn(req: userRequest, res: Response): Promise<void> {
    if (req.user) {
        const token = signToken(req.user)
        res.status(200).json({ token })
    } else {
        res.status(202).json({error: messages.UNKOWN_USER_PASS});
    }

}

export async function updateUser(req: userBodyRequest, res: Response): Promise<void> {
    try {
        const User: UserModelType | null | undefined = req.user;
        if (User) {

            const { username, email } = { ...req.body }
            User.username = username;
            User.email = email ? email : User.email;
            User.save()

            res.status(200).json({message: 'User updated'}) 
        } else {
            res.json({message: 'User not found'}) 
        }
    } catch (e) {
        res.status(402).json({error: e})
    }

}

function checkAndEmail(
    err: any, 
    _: any, 
    res: Response<any>, 
    existence: UserModelType | null, 
    pass: string
) {
    if (err){
        res.send({error: 'there was an error while trying to send you an email, please try again later'});
    } else {
        transport.sendMail({
            ...options, 
            text: `Reset your password by visiting ${process.env.REACT_APP_URL}/reset?user=${existence?.username}&rcp=${pass}`,
            to: existence?.email,
        })
        res.status(200).send({data: 'An email has been sent to you'})
    }
}

export async function emailRecoverPassword(req: Request<any>, res: Response): Promise<void> {
    try {
        const query = req.body.type === 'username' ? {username: req.body.data} : {email: req.body.data};
            const existence = await UserModel.findOne(query).exec()
            if (existence){
                const exist_rec = await UserRecoverModel.findOne({user: existence._id}).exec()
                const password = makeid(64);
                const timeout = (Date.now()) + (60 * 45 * 1000);

                if (exist_rec){

                    await UserRecoverModel.update({user: existence._id}, {password, timeout}, (err, raw) => {checkAndEmail(err, raw, res, existence, password)}).exec()
                } else {
                    const newUser = new UserRecoverModel({user: existence._id, password, timeout })
                    newUser.save()
                        .then(() => {checkAndEmail(undefined, undefined, res, existence, password)})
                        .catch(e => {res.status(202).send({error: e})})
                }
            } else {
                res.status(202).send({error: messages.UNKOWN_USERNAME_EMAIL});
            }
    } catch (e) {
        res.status(403).send(e)
    }
}

export async function checkLink(req: Request<any>, res: Response): Promise<void> {
    try {
        const { user, rcp } = req.body;
        const User = await UserModel.findOne({username: user}).exec()

        if (User){
            const existence = await UserRecoverModel.findOne({user: User._id, password: rcp}).exec();
            if (existence){
                const now = Date.now() ;

                if (now < existence.timeout){
                    res.status(200).send({data: 'allowed'})
                } else {
                    res.status(202).send({ error: 'expired link' })
                }
            } else {
                res.status(202).json({error: messages.INVALID_RESET_LINK});
            }
        }
    } catch (e) {
        res.status(202).send(e);
    }
} 

export async function resetPassword(req: Request<any>, res: Response): Promise<void> {
    try {
        const { username, password, secret } = req.body
        const User = await UserModel.findOne({username: username}).exec()

        if (User?.method === 'google'){
            res.status(202).send({error: 'No password registred, this account is linked with google'});
            return
        }
        let existence;
        if (User){
            existence = await UserRecoverModel.findOne({user: User._id, password: secret}).exec();

        }

        if (existence && existence.timeout > Date.now()){
            await UserRecoverModel.deleteOne({user: User?._id}).exec()

            if (User?.local){
                User.local.password = password;
                User?.save()
                    .then(__ => { res.status(200).send({data: 'reseted'}) })
                    .catch(__ => { res.send({error: messages.RESET_PASSWORD_ERROR}) })
            }

        } else 
            res.send({error: messages.RESET_PASSWORD_ERROR})
        
    } catch (e) {
        res.status(400).send({error: messages.RESET_PASSWORD_ERROR});
    }
}


export async function deleteUser(
    req: userBodyRequest,
    res: Response,
): Promise<void> {
    try {
        let User: UserModelType | null | undefined = req.user;
        const _id: string | undefined = User?._id

        if (User && _id){
            ProjectModel.deleteMany({ user: _id })
            InstrumentModel.deleteMany({ user: _id })
            EffectModel.deleteMany({ user: _id })
            User = undefined;

            UserModel.deleteOne({ _id: _id })
                .then(__ => { res.status(200).json({ message: messages.USER_DELETED }) })
                .catch(__ => {res.json({error: messages.DELETE_USER_ERROR})})

        } else {
            res.json({error: messages.UNKOWN_USER_PASS})
            return
        }

    } catch (e) {
        res.status(202).json({error: messages.DELETE_USER_ERROR})        
    }

}

export async function google(
    req: userBodyRequest,
    res: Response
): Promise<void> {
    const tokenId = req.body.token
    const googleId = req.body.id

    client.verifyIdToken({ idToken: tokenId, audience: process.env.CLIENT_ID })
        .then(
            async (response) => {
                try {
                    const payload = response.getAttributes().payload

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
                        res.status(203).send(messages.UNKOWN_USER_PASS)
                    }
                } catch (error) {
                    res.status(203).json(error)
                }
            }
        )
}


