import mongoose, { Schema } from 'mongoose';

interface IFavorite {
    userId: string;
    propertyId: string;
}

const favoriteSchema = new Schema<IFavorite>({
    userId: { type: String, required: true },
    propertyId: { type: String, required: true }
});

export default mongoose.model<IFavorite>('Favorite', favoriteSchema);