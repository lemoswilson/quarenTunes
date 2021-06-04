import Joi from 'joi';
import { NextFunction, Request, Response } from 'express'

declare module 'express' {
    export interface Request {
        value?: {
            username: string,
            password: string,
            email?: string,
            method: 'local' | 'google'
        },
        user?: any,
    }
}

export enum messages {
    UNKOWN_USER_PASS = "Username or password entered is not correct",
    UNKOWN_USERNAME_EMAIL = "The username/email is not registred",
    CREATED_GOOGLE = "Account linked to google, first create a password in options",
    USER_ALREADY_EXISTS = "Username already exists",
    DATA_VALIDATION_ERROR = "Data validation error",
    USER_DELETED = "User deleted",
    INFORMATION_RETRIEVAL_ERROR = "there was a problem trying to retrieve the information",
    PROJECT_SAVED = "Project saved",
    PROJECT_DELETED = "Project deleted",
    INSTRUMENT_SAVED = "Instrument saved",
    INSTRUMENT_DELETED = "Instrument deleted",
    EFFECT_SAVED = "Effect saved",
    EFFECT_DELETED = "Effect deleted",
    DELETE_USER_ERROR = "An error occurred when trying to delete user, please try again later",
    NO_EMAIL_VERIFIED = 'no email verified, and no user id found on account',
    EMAIL_EXISTS = "Email already registred",
    RESET_PASSWORD_ERROR = 'An error occurred while trying to reset your password, please try again later',
    INVALID_RESET_LINK = 'This is an invalid reset link',
    GENERAL_ERROR = "There was an error processing your request, please try again later"
}

export enum modelTypes {
    INSTRUMENT = "instrument",
    EFFECT = "effect",
    PROJECT = "project"
}

export function makeid(length: number) {
    var result           = [];
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result.push(characters.charAt(Math.floor(Math.random() * charactersLength)));
   }
   return result.join('');
}

export function validateBody(schema: Joi.ObjectSchema<any>) {
    return (req: Request, res: Response, next: NextFunction) => {

        const validation = schema.validate(req.body);
        if (validation.error) {
            return res.status(400).json({ error: validation.error.message })
        }

        req.body = { ...validation.value }

        return next();
    }
}

export const schemas = {
    authSchema: Joi.object().keys({
        email: Joi.string().email().required(),
        username: Joi.string().required().insensitive().regex(/^(?=.{6,20}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/),
        password: Joi.string().required().regex(/^(?=.{6,16}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/),
        method: Joi.string().required().valid(...['local', 'google'])
    }),
    udateSchema: Joi.object().keys({
        email: Joi.string().email().required(),
        username: Joi.string().required().insensitive().regex(/^(?=.{6,20}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/),
        password: Joi.string().required().regex(/^(?=.{6,16}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/),
    }),
    passSchema: Joi.object().keys({
        username: Joi.string().required().regex(/^(?=.{6,20}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/),
        password: Joi.string().required().regex(/^(?=.{6,16}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/),
    }),
    resetPassword: Joi.object().keys({
        username: Joi.string().required().regex(/^(?=.{6,20}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/),
        password: Joi.string().required().regex(/^(?=.{6,16}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/),
        secret: Joi.string().required().regex(/^(?=.{64}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/),
        confirmationPassword: Joi.any().valid(Joi.ref('password')).required(),
    })
}