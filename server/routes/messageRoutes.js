import express from 'express';

import {
  sendMessage,
  getMessages,
  getConversations
} from '../controllers/messageController.js';

const router = express.Router();

router.post('/', sendMessage);

router.get('/conversations', getConversations);

router.get('/', getMessages);

export default router;