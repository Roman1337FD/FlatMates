import express from 'express';

import {
  calculateCompatibility
} from '../controllers/matchControllers.js';

import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.post(
  '/calculate',
  protect,
  calculateCompatibility
);

export default router;