import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { recommendProperty, getRecommendations } from '../controllers/recommendationController';

const router = Router();

router.post('/', authenticateToken, recommendProperty);
router.get('/', authenticateToken, getRecommendations);

export default router;