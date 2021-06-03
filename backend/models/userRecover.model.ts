import mongoose, { Schema, Document } from 'mongoose';
import { UserModelType } from './user.model';

interface UserRecover {
    user: UserModelType['_id'],
    password: string, 
    timeout: number,
}

interface UserRecoverModelType extends UserRecover, Document {};

const UserRecoverModel = new Schema({
    user: { type: Schema.Types.ObjectId, required: true},
    password: { type: String, required: true},
    timeout: { type: Number, required: true }
});

export default mongoose.model<UserRecoverModelType>('UserRecoverModel', UserRecoverModel);
