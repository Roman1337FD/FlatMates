import express from 'express';

import {
  sendMessage,
  getMessages,
  getConversations
} from '../controllers/messageController.js';

import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.post(
  '/',
  protect,
  sendMessage
);

router.get(
  '/conversations',
  protect,
  getConversations
);

router.get(
  '/',
  protect,
  getMessages
);

export default router;