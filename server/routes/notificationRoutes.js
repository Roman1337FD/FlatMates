import express from 'express';

import {
  getNotifications,
  getUnreadCount,
  markNotificationRead,
  markChatNotificationsRead,
  markAllNotificationsRead
} from '../controllers/notificationController.js';

import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.get(
  '/',
  protect,
  getNotifications
);

router.get(
  '/unread-count',
  protect,
  getUnreadCount
);

router.put(
  '/chat/read',
  protect,
  markChatNotificationsRead
);

router.put(
  '/read-all',
  protect,
  markAllNotificationsRead
);

router.put(
  '/:notificationId/read',
  protect,
  markNotificationRead
);

export default router;