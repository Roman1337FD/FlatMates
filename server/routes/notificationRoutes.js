import express from 'express';

import {
  getNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead
} from '../controllers/notificationController.js';

const router = express.Router();

router.get('/', getNotifications);

router.get('/unread-count', getUnreadCount);

router.put('/:notificationId/read', markNotificationRead);

router.put('/read-all', markAllNotificationsRead);

export default router;