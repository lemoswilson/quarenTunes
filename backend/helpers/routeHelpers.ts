import Joi from 'joi';
import { NextFunction, Request, Response } from 'express'

declare module 'express' {
    export interface Request {
        value?: {
            username: string,
            lastName?: string,
            firstName?: string,
            password: string,
            confirmationPassword?: string,
            email?: string,
            method: 'local' | 'google'
        },
        user?: any,
    }
}

export function validateBody(schema: Joi.ObjectSchema<any>) {
    return (req: Request, res: Response, next: NextFunction) => {
        console.log('validating body');
        const validation = schema.validate(req.body);

        if (validation.error) {
            return res.status(400).json(validation.error)
        }

        req.value = { ...validation.value }
        return next();
    }
}


export const schemas = {
    authSchema: Joi.object().keys({
        email: Joi.string().email().required(),
        username: Joi.string().required().insensitive().regex(/^(?=.{8,20}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/),
        password: Joi.string().required().regex(/^(?=.{8,20}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/),
        confirmationPassword: Joi.any().valid(Joi.ref('password')).required(),
        firstName: Joi.string().required().regex(/^[a-zA-Z]+$/),
        lastName: Joi.string().required().regex(/^[a-zA-Z]+$/),
        method: Joi.string().required().valid(...['local', 'google'])

    }),
    passSchema: Joi.object().keys({
        username: Joi.string().required().regex(/^(?=.{8,20}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/),
        password: Joi.string().required().regex(/^(?=.{8,20}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/),
    })
}