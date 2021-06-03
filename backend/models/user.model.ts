import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs'

export interface User {
    email: string,
    local?: {
        password?: string,
    },
    google?: {
        id?: string,
    }
    username?: string,
    method: 'local' | 'google'
}

export interface UserBody {
    email?: string,
    username: string,
    password: string,
    method?: string,
    token: string,
    access: string,
    id: string
}

export const hashPassword = async (password: string) => {
    try {
        const salt = await bcrypt.genSalt(10)
        return await bcrypt.hash(password, salt)
    } catch (error) {
        throw new Error('hashing failed')
    }
}

export const comparePassword = async (inputPassword: string, hashedPassword: string) => {
    try {
        return await bcrypt.compare(inputPassword, hashedPassword);
    } catch (error) {
        throw new Error('wrong password')
    }
}

export interface UserModelType extends User, Document { }

const UserSchema: Schema = new Schema({
    email: { type: String, required: true, unique: true, lowercase: true },
    local: {
        password: String,
    },
    google: {
        id: { type: String, unique: false },
    },
    username: { type: String, unique: true, minlength: 6 },
    method: { type: String, required: true, enum: ['local', 'google'] }
}, { timestamps: true })

UserSchema.pre<UserModelType>('save', async function (next) {
    try {
        if (this.method !== "local") { 
            next() 
        }
        if (this.local?.password)
            this.local.password = await hashPassword(this.local.password);
        next();
    } catch (error) {
        next(error)
    }
})

export default mongoose.model<UserModelType>('User', UserSchema);