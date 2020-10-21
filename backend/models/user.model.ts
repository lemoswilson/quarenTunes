import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs'

export interface User extends password {
    email: string,
    firstName: string,
    lastName: string,
}

export interface password {
    password: string,
    username: string,
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
    username: { type: String, required: true, unique: true, minlength: 6 },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    password: { type: String, required: true }
}, { timestamps: true })

UserSchema.pre<UserModelType>('save', async function (next) {
    try {
        this.password = await hashPassword(this.password);
        next();
    } catch (error) {
        next(error)
    }
})

export default mongoose.model<UserModelType>('User', UserSchema);