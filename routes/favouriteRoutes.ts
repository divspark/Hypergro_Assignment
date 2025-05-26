import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { addFavorite, getFavorites, removeFavorite } from '../controllers/favouriteController';

const router = Router();

router.post('/', authenticateToken, addFavorite);
router.get('/', authenticateToken, getFavorites);
router.delete('/:propertyId', authenticateToken, removeFavorite);

export default router;