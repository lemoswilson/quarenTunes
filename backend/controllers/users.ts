import { Response, Request, NextFunction } from 'express'
import { ParamsDictionary, Query } from 'express-serve-static-core';
import JWT from 'jsonwebtoken';
import UserModel, { User } from '../models/user.model'
import ProjectModel from '../models/project.model'
import InstrumentModel from '../models/instrument.model'
import EffectModel from '../models/effect.model';
import { JWT_SECRET } from '../config/token';

type userRequest = Request<ParamsDictionary, User, any, Query>

export interface JWTToken {
    iss: string,
    sub: string,
    iat: Date,
    exp: Date,
}

const signToken = (user: any) => {
    const token = JWT.sign({
        iss: 'xolombrisx',
        sub: user._id,
        iat: new Date().getTime(),
        exp: new Date().setDate(new Date().getDay() + 1),
    }, JWT_SECRET);
    return token
}

export async function signUp(req: userRequest, res: Response) {
    if (req.value) {
        const { username, email, firstName, lastName, password, method } = { ...req.value }
        const existence = await UserModel.findOne({ email: email, username: username }).exec();
        if (!existence) {
            const newUser = new UserModel({ username, email, firstName, lastName, local: { password }, method })
            newUser.save()
                .then((user) => { res.status(200).json({ token: signToken(user) }) })
                .catch((err) => { res.send(err) })
        } else
            res.status(403).send({ error: "User already exists" });
    }
};

export async function signIn(req: userRequest, res: Response, next: NextFunction) {
    if (req.user) {
        const token = signToken(req.value)
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