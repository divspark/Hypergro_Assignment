import mongoose, { Schema } from 'mongoose';

interface IProperty {
    title: string;
    description: string;
    price: number;
    location: {
        address: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };
    bedrooms: number;
    bathrooms: number;
    area: number;
    type: string;
    status: string;
    createdBy: string;
    createdAt: Date;
}

const propertySchema = new Schema<IProperty>({
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    location: {
        address: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
    },
    bedrooms: Number,
    bathrooms: Number,
    area: Number,
    type: String,
    status: String,
    createdBy: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IProperty>('Property', propertySchema);