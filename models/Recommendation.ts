import mongoose, { Schema } from 'mongoose';

interface IRecommendation {
    fromUserId: string;
    toUserId: string;
    propertyId: string;
    createdAt: Date;
}

const recommendationSchema = new Schema<IRecommendation>({
    fromUserId: { type: String, required: true },
    toUserId: { type: String, required: true },
    propertyId: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IRecommendation>('Recommendation', recommendationSchema);