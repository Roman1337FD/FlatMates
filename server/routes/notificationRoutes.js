import express from 'express';

import {
  getNotifications,
  getUnreadCount,
  markNotificationRead,
  markChatNotificationsRead,
  markAllNotificationsRead
} from '../controllers/notificationController.js';

const router = express.Router();

router.get('/', getNotifications);

router.get('/unread-count', getUnreadCount);

router.put('/chat/read', markChatNotificationsRead);

router.put('/read-all', markAllNotificationsRead);

router.put('/:notificationId/read', markNotificationRead);

export default router;