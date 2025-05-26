import { Request, Response } from 'express';
import { redisClient } from '../config/db';
import Favourite from '../models/Favourite';

export const addFavorite = async (req: Request, res: Response) => {
    try {
        const { propertyId } = req.body;
        const favorite = new Favourite({ userId: req.userId, propertyId });
        await favorite.save();
        
        await redisClient.del(`favorites:${req.userId}`);
        res.status(201).json(favorite);
    } catch (error) {
        res.status(400).json({ error: 'Error adding to favorites' });
    }
};

export const getFavorites = async (req: Request, res: Response): Promise<void> => {
    try {
        const cacheKey = `favorites:${req.userId}`;
        const cachedFavorites = await redisClient.get(cacheKey);
        if (cachedFavorites) {
            res.json(JSON.parse(cachedFavorites));
            return;
        }

        const favorites = await Favourite.find({ userId: req.userId }).populate('propertyId');
        await redisClient.setEx(cacheKey, 3600, JSON.stringify(favorites));
        res.json(favorites);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching favorites' });
    }
};

export const removeFavorite = async (req: Request, res: Response) => {
    try {
        await Favourite.deleteOne({ userId: req.userId, propertyId: req.params.propertyId });
        await redisClient.del(`favorites:${req.userId}`);
        res.json({ message: 'Removed from favorites' });
    } catch (error) {
        res.status(500).json({ error: 'Error removing from favorites' });
    }
};