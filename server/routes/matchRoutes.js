import express from 'express';
import { calculateCompatibility } from '../controllers/matchControllers.js';

const router = express.Router();

router.post('/calculate', calculateCompatibility);

export default router;