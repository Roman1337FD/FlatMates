import Notification from '../models/notification.js';

export const getNotifications = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        message: 'User ID is required'
      });
    }

    const notifications = await Notification.find({
      receiverId: userId
    })
      .populate('senderId', 'name email')
      .sort({ createdAt: -1 })
      .limit(30);

    res.json(notifications);
  } catch (error) {
    console.error('Get Notifications Error:', error);

    res.status(500).json({
      message: 'Failed to load notifications'
    });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        message: 'User ID is required'
      });
    }

    const count = await Notification.countDocuments({
      receiverId: userId,
      isRead: false
    });

    res.json({
      count
    });
  } catch (error) {
    console.error('Unread Count Error:', error);

    res.status(500).json({
      message: 'Failed to get unread count'
    });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification =
      await Notification.findByIdAndUpdate(
        notificationId,
        {
          isRead: true
        },
        {
          new: true
        }
      );

    if (!notification) {
      return res.status(404).json({
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      notification
    });
  } catch (error) {
    console.error('Mark Notification Error:', error);

    res.status(500).json({
      message: 'Failed to mark notification'
    });
  }
};

export const markChatNotificationsRead = async (
  req,
  res
) => {
  try {
    const { userId, senderId } = req.body;

    if (!userId || !senderId) {
      return res.status(400).json({
        message: 'User ID and sender ID are required'
      });
    }

    const result = await Notification.updateMany(
      {
        receiverId: userId,
        senderId: senderId,
        isRead: false
      },
      {
        isRead: true
      }
    );

    const io = req.app.get('io');

    if (io) {
      io.to(`user_${userId}`).emit(
        'notifications_read',
        {
          userId,
          senderId
        }
      );
    }

    res.json({
      success: true,
      message: 'Chat notifications marked as read',
      updatedCount: result.modifiedCount
    });
  } catch (error) {
    console.error(
      'Mark Chat Notifications Error:',
      error
    );

    res.status(500).json({
      message: 'Failed to mark chat notifications'
    });
  }
};

export const markAllNotificationsRead = async (
  req,
  res
) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        message: 'User ID is required'
      });
    }

    await Notification.updateMany(
      {
        receiverId: userId,
        isRead: false
      },
      {
        isRead: true
      }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error(
      'Mark All Notifications Error:',
      error
    );

    res.status(500).json({
      message: 'Failed to mark notifications'
    });
  }
};