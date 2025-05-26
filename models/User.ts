import mongoose, { Schema } from 'mongoose';

interface IUser {
    email: string;
    password: string;
    name: string;
}

const userSchema = new Schema<IUser>({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true }
});

export default mongoose.model<IUser>('User', userSchema);