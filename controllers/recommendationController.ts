import { Request, Response } from 'express';
import Recommendation from '../models/Recommendation';
import User from '../models/User';
import { redisClient } from '../config/db';

export const recommendProperty = async (req: Request, res: Response): Promise<void> => {
    try {
        const { propertyId, recipientEmail } = req.body;
        const recipient = await User.findOne({ email: recipientEmail });
        if (!recipient) {
            res.status(404).json({
                success: false,
                message: 'Recipient not found'
            });
            return;  // stop further execution
        }

        const recommendation = new Recommendation({
            fromUserId: req.userId,
            toUserId: recipient._id,
            propertyId,
        });
        await recommendation.save();

        await redisClient.del(`recommendations:${recipient._id}`);
        res.status(201).json({
            success: true,
            message: 'Recommendation created successfully',
            data: recommendation
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error creating recommendation'
        });
    }
};

export const getRecommendations = async (req: Request, res: Response): Promise<void> => {
    try {
        const cacheKey = `recommendations:${req.userId}`;
        const cachedRecommendations = await redisClient.get(cacheKey);
        if (cachedRecommendations) {
            res.json({
                success: true,
                message: 'Recommendations fetched successfully from cache',
                data: JSON.parse(cachedRecommendations)
            });
            return;
        }

        const recommendations = await Recommendation.find({ toUserId: req.userId })
            .populate('propertyId')
            .populate('fromUserId', 'name email');

        await redisClient.setEx(cacheKey, 3600, JSON.stringify(recommendations));
        res.json({
            success: true,
            message: 'Recommendations fetched successfully',
            data: recommendations
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching recommendations'
        });
    }
};

