import { Request, Response } from 'express';
import Property from '../models/Property';
import { redisClient } from '../config/db';

export const createProperty = async (req: Request, res: Response): Promise<void> => {
    try {
        const property = new Property({ ...req.body, createdBy: req.userId });
        await property.save();
        await redisClient.del('properties');
        res.status(201).json(property);
    } catch (error) {
        res.status(400).json({ error: 'Error creating property' });
    }
};

export const getProperties = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;
        const skip = (page - 1) * limit;

        const cacheKey = `properties:page:${page}:limit:${limit}`;
        const cachedProperties = await redisClient.get(cacheKey);

        if (cachedProperties) {
            const parsed = JSON.parse(cachedProperties);
            res.json(parsed);
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
        res.json(response);
    } catch (error) {
        console.error("Error fetching properties:", error);
        res.status(500).json({ error: 'Error fetching properties' });
    }
};


export const getProperty = async (req: Request, res: Response): Promise<void> => {
    try {
        const cachedProperty = await redisClient.get(`property:${req.params.id}`);
        if (cachedProperty) {
            res.json(JSON.parse(cachedProperty));
            return;
        }

        const property = await Property.findById(req.params.id);
        if (!property) {
            res.status(404).json({ error: 'Property not found' });
            return;
        }

        await redisClient.setEx(`property:${req.params.id}`, 3600, JSON.stringify(property));
        res.json(property);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching property' });
    }
};

export const updateProperty = async (req: Request, res: Response): Promise<void> => {
    try {
        const property = await Property.findById(req.params.id);
        if (!property) {
            res.status(404).json({ error: 'Property not found' });
            return;
        }

        if (property.createdBy !== req.userId) {
            res.status(403).json({ error: 'Unauthorized to update this property' });
            return;
        }

        const updatedProperty = await Property.findByIdAndUpdate(req.params.id, req.body, { new: true });
        await redisClient.del(`property:${req.params.id}`);
        await redisClient.del('properties');

        res.json(updatedProperty);
    } catch (error) {
        res.status(400).json({ error: 'Error updating property' });
    }
};

export const deleteProperty = async (req: Request, res: Response): Promise<void> => {
    try {
        const property = await Property.findById(req.params.id);
        if (!property) {
            res.status(404).json({ error: 'Property not found' });
            return;
        }

        if (property.createdBy !== req.userId) {
            res.status(403).json({ error: 'Unauthorized to delete this property' });
            return;
        }

        await Property.findByIdAndDelete(req.params.id);
        await redisClient.del(`property:${req.params.id}`);
        await redisClient.del('properties');

        res.json({ message: 'Property deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting property' });
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

        const cacheKey = `search:${JSON.stringify(query)}`;
        const cachedResults = await redisClient.get(cacheKey);
        if (cachedResults) {
            res.json(JSON.parse(cachedResults));
            return;
        }

        const properties = await Property.find(query);
        await redisClient.setEx(cacheKey, 3600, JSON.stringify(properties));
        res.json(properties);
    } catch (error) {
        res.status(500).json({ error: 'Error searching properties' });
    }
};
