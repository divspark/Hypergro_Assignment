import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import {  createProperty, getProperties, getProperty, updateProperty, deleteProperty, searchProperties } from '../controllers/propertyController';

const router = Router();

// router.post('/import', importCSV);
router.post('/', authenticateToken, createProperty);
router.get('/', getProperties);
router.get('/search', searchProperties);
router.get('/:id', getProperty);
router.put('/:id', authenticateToken, updateProperty);
router.delete('/:id', authenticateToken, deleteProperty);

export default router;