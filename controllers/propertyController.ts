import { Request, Response } from 'express';
import { z, ZodIssue } from 'zod';
import Property from '../models/Property';
import { redisClient } from '../config/db';
import mongoose from 'mongoose';

// Define Zod schema for Property
const PropertySchema = z.object({
    title: z.string().trim().min(1, 'Title is required').max(100, 'Title must be 100 characters or less'),
    description: z.string().trim().max(1000, 'Description must be 1000 characters or less').optional(),
    price: z.number().positive('Price must be a positive number'),
    location: z.object({
        address: z.string().trim().min(1, 'Street address is required'),
        city: z.string().trim().min(1, 'City is required'),
        state: z.string().trim().min(1, 'State is required'),
        zipCode: z.string().trim().min(1, 'Zip code is required'),
        country: z.string().trim().min(1, 'Country is required')
    }),
    bedrooms: z.number().int().min(0, 'Bedrooms must be a non-negative integer'),
    bathrooms: z.number().min(0, 'Bathrooms must be a non-negative number'),
    area: z.number().positive('Area must be a positive number'),
    type: z.enum(['Apartment', 'House', 'Condo', 'Land'], { errorMap: () => ({ message: 'Invalid property type' }) }),
    status: z.enum(['For Sale', 'For Rent', 'Sold'], { errorMap: () => ({ message: 'Invalid property status' }) })
});

// Schema for partial updates
const PartialPropertySchema = PropertySchema.partial({
    title: true,
    price: true,
    location: true,
    bedrooms: true,
    bathrooms: true,
    area: true,
    type: true,
    status: true
}).strict();

// Schema for params
const ParamsSchema = z.object({
    id: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
        message: 'Invalid property ID'
    })
});

type PropertyInput = z.infer<typeof PropertySchema>;

export const createProperty = async (req: Request, res: Response): Promise<void> => {
    try {
        // Validate request body with Zod
        const result = PropertySchema.safeParse(req.body);
        if (!result.success) {
            res.status(400).json({
                success: false,
                message: 'Validation failed',
                data: {
                    errors: result.error.issues.map((issue: ZodIssue) => ({
                        field: issue.path.join('.'),
                        message: issue.message
                    }))
                }
            });
            return;
        }

        // Verify userId from JWT (set by authMiddleware)
        if (!req.userId) {
            res.status(401).json({
                success: false,
                message: 'Unauthorized: Missing user authentication'
            });
            return;
        }

        // Extract validated data
        const {
            title,
            description,
            price,
            location,
            bedrooms,
            bathrooms,
            area,
            type,
            status
        }: PropertyInput = result.data;

        // Check for duplicate property
        const existingProperty = await Property.findOne({
            'location.address': location.address,
            'location.city': location.city,
            'location.zipCode': location.zipCode,
            type
        });
        if (existingProperty) {
            res.status(409).json({
                success: false,
                message: 'Property already exists at this address with the same type'
            });
            return;
        }

        // Create new property
        const property = new Property({
            title,
            description,
            price,
            location,
            bedrooms,
            bathrooms,
            area,
            type,
            status,
            createdBy: req.userId
        });

        // Save to MongoDB
        await property.save();

        // Clear Redis cache
        try {
            await redisClient.del('pls:properties');
            console.log('Cleared properties cache');
        } catch (redisError) {
            console.error('Failed to clear properties cache:', redisError);
        }

        res.status(201).json({
            success: true,
            message: 'Property created successfully',
            data: property
        });
    } catch (error: any) {
        console.error('Error creating property:', error);

        // Handle MongoDB errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((err: any) => ({
                field: err.path,
                message: err.message
            }));
            res.status(400).json({
                success: false,
                message: 'Validation failed',
                data: { errors: messages }
            });
            return;
        }

        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const getProperties = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;
        const skip = (page - 1) * limit;

        const cacheKey = `pls:properties:page:${page}:limit:${limit}`;
        const cachedProperties = await redisClient.get(cacheKey);

        if (cachedProperties) {
            const parsed = JSON.parse(cachedProperties);
            res.json({
                success: true,
                message: 'Properties fetched successfully from cache',
                data: parsed
            });
            return;
        }

        const [properties, totalCount] = await Promise.all([
            Property.find().skip(skip).limit(limit),
            Property.countDocuments()
        ]);

        const hasMore = page * limit < totalCount;

        const response = {
            properties,
            hasMore
        };

        await redisClient.setEx(cacheKey, 3600, JSON.stringify(response));
        res.json({
            success: true,
            message: 'Properties fetched successfully',
            data: response
        });
    } catch (error) {
        console.error('Error fetching properties:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching properties'
        });
    }
};

export const getProperty = async (req: Request, res: Response): Promise<void> => {
    try {
        // Validate params
        const paramsResult = ParamsSchema.safeParse(req.params);
        if (!paramsResult.success) {
            res.status(400).json({
                success: false,
                message: 'Validation failed',
                data: {
                    errors: paramsResult.error.issues.map((issue: ZodIssue) => ({
                        field: issue.path.join('.'),
                        message: issue.message
                    }))
                }
            });
            return;
        }

        const cacheKey = `pls:property:${req.params.id}`;
        const cachedProperty = await redisClient.get(cacheKey);
        if (cachedProperty) {
            res.json({
                success: true,
                message: 'Property fetched successfully from cache',
                data: JSON.parse(cachedProperty)
            });
            return;
        }

        const property = await Property.findById(req.params.id);
        if (!property) {
            res.status(404).json({
                success: false,
                message: 'Property not found'
            });
            return;
        }

        await redisClient.setEx(cacheKey, 3600, JSON.stringify(property));
        res.json({
            success: true,
            message: 'Property fetched successfully',
            data: property
        });
    } catch (error: any) {
        console.error('Error fetching property:', error);
        if (error.name === 'CastError' && error.kind === 'ObjectId') {
            res.status(400).json({
                success: false,
                message: 'Invalid property ID'
            });
            return;
        }
        res.status(500).json({
            success: false,
            message: 'Error fetching property'
        });
    }
};

export const updateProperty = async (req: Request, res: Response): Promise<void> => {
    try {
        // Validate params
        const paramsResult = ParamsSchema.safeParse(req.params);
        if (!paramsResult.success) {
            res.status(400).json({
                success: false,
                message: 'Validation failed',
                data: {
                    errors: paramsResult.error.issues.map((issue: ZodIssue) => ({
                        field: issue.path.join('.'),
                        message: issue.message
                    }))
                }
            });
            return;
        }

        // Validate request body with Zod
        const result = PartialPropertySchema.safeParse(req.body);
        if (!result.success) {
            res.status(400).json({
                success: false,
                message: 'Validation failed',
                data: {
                    errors: result.error.issues.map((issue: ZodIssue) => ({
                        field: issue.path.join('.'),
                        message: issue.message
                    }))
                }
            });
            return;
        }

        // Find property
        const property = await Property.findById(req.params.id);
        if (!property) {
            res.status(404).json({
                success: false,
                message: 'Property not found'
            });
            return;
        }

        // Check authorization
        if (property.createdBy.toString() !== req.userId) {
            res.status(403).json({
                success: false,
                message: 'Unauthorized to update this property'
            });
            return;
        }

        // Update property
        const updatedProperty = await Property.findByIdAndUpdate(
            req.params.id,
            result.data,
            { new: true, runValidators: true }
        );

        // Clear Redis cache
        try {
            await Promise.all([
                redisClient.del(`pls:property:${req.params.id}`),
                redisClient.del('pls:properties')
            ]);
            console.log('Cleared property and properties cache');
        } catch (err) {
            console.error('Failed to clear Redis cache:', err);
        }

        res.json({
            success: true,
            message: 'Property updated successfully',
            data: updatedProperty
        });
    } catch (error: any) {
        console.error('Error updating property:', error);

        // Handle MongoDB errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((err: any) => ({
                field: err.path,
                message: err.message
            }));
            res.status(400).json({
                success: false,
                message: 'Validation failed',
                data: { errors: messages }
            });
            return;
        }

        if (error.name === 'CastError' && error.kind === 'ObjectId') {
            res.status(400).json({
                success: false,
                message: 'Invalid property ID'
            });
            return;
        }

        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const deleteProperty = async (req: Request, res: Response): Promise<void> => {
    try {
        // Validate params
        const paramsResult = ParamsSchema.safeParse(req.params);
        if (!paramsResult.success) {
            res.status(400).json({
                success: false,
                message: 'Validation failed',
                data: {
                    errors: paramsResult.error.issues.map((issue: ZodIssue) => ({
                        field: issue.path.join('.'),
                        message: issue.message
                    }))
                }
            });
            return;
        }

        const property = await Property.findById(req.params.id);
        if (!property) {
            res.status(404).json({
                success: false,
                message: 'Property not found'
            });
            return;
        }

        if (property.createdBy.toString() !== req.userId) {
            res.status(403).json({
                success: false,
                message: 'Unauthorized to delete this property'
            });
            return;
        }

        await Property.findByIdAndDelete(req.params.id);
        try {
            await Promise.all([
                redisClient.del(`pls:property:${req.params.id}`),
                redisClient.del('pls:properties')
            ]);
            console.log('Cleared property and properties cache');
        } catch (err) {
            console.error('Failed to clear Redis cache:', err);
        }

        res.json({
            success: true,
            message: 'Property deleted successfully'
        });
    } catch (error: any) {
        console.error('Error deleting property:', error);
        if (error.name === 'CastError' && error.kind === 'ObjectId') {
            res.status(400).json({
                success: false,
                message: 'Invalid property ID'
            });
            return;
        }
        res.status(500).json({
            success: false,
            message: 'Error deleting property'
        });
    }
};

export const searchProperties = async (req: Request, res: Response): Promise<void> => {
    try {
        const query: any = {};
        if (req.query.city) query['location.city'] = req.query.city;
        if (req.query.state) query['location.state'] = req.query.state;
        if (req.query.country) query['location.country'] = req.query.country;
        if (req.query.minPrice) query.price = { $gte: Number(req.query.minPrice) };
        if (req.query.maxPrice) query.price = { ...query.price, $lte: Number(req.query.maxPrice) };
        if (req.query.bedrooms) query.bedrooms = Number(req.query.bedrooms);
        if (req.query.bathrooms) query.bathrooms = Number(req.query.bathrooms);
        if (req.query.minArea) query.area = { $gte: Number(req.query.minArea) };
        if (req.query.maxArea) query.area = { ...query.area, $lte: Number(req.query.maxArea) };
        if (req.query.type) query.type = req.query.type;
        if (req.query.status) query.status = req.query.status;

        const cacheKey = `pls:search:${JSON.stringify(query)}`;
        const cachedResults = await redisClient.get(cacheKey);
        if (cachedResults) {
            res.json({
                success: true,
                message: 'Search results fetched successfully from cache',
                data: JSON.parse(cachedResults)
            });
            return;
        }

        const properties = await Property.find(query);
        await redisClient.setEx(cacheKey, 3600, JSON.stringify(properties));
        res.json({
            success: true,
            message: 'Search results fetched successfully',
            data: properties
        });
    } catch (error) {
        console.error('Error searching properties:', error);
        res.status(500).json({
            success: false,
            message: 'Error searching properties'
        });
    }
};