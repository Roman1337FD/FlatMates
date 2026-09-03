import mongoose from 'mongoose';
import Message from '../models/messages.js';
import Notification from '../models/notification.js';
import User from '../models/user.js';

const MAX_MESSAGE_LENGTH = 1000;

export const sendMessage = async (req, res) => {
  try {
    const { receiverId, text } = req.body;
    const senderId = req.userId;

    if (!senderId || !receiverId || !text?.trim()) {
      return res.status(400).json({
        message: 'Receiver and message are required'
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(receiverId)
    ) {
      return res.status(400).json({
        message: 'Invalid receiver ID'
      });
    }

    if (text.trim().length > MAX_MESSAGE_LENGTH) {
      return res.status(400).json({
        message:
          'Message must be 1000 characters or less'
      });
    }

    if (String(senderId) === String(receiverId)) {
      return res.status(400).json({
        message: 'You cannot message yourself'
      });
    }

    const receiver =
      await User.findById(receiverId)
        .select('_id name')
        .lean();

    if (!receiver) {
      return res.status(404).json({
        message: 'Receiver not found'
      });
    }

    const message = await Message.create({
      senderId,
      receiverId,
      text: text.trim()
    });

    const sender =
      await User.findById(senderId)
        .select('name')
        .lean();

    const notificationText =
      `${sender?.name || 'Someone'} sent you a message`;

    await Notification.create({
      receiverId,
      senderId,
      type: 'message',
      message: notificationText
    });

    const result =
      await Message.findById(message._id)
        .populate('senderId', 'name')
        .populate('receiverId', 'name');

    const io = req.app.get('io');

    if (io) {
      io.to(`user_${receiverId}`).emit(
        'receive_message',
        result
      );

      io.to(`user_${receiverId}`).emit(
        'new_notification',
        {
          receiverId,
          senderId,
          type: 'message',
          message: notificationText,
          createdAt: new Date()
        }
      );
    }

    res.status(201).json(result);
  } catch (error) {
    console.error(
      'Send Message Error:',
      error
    );

    res.status(500).json({
      message: 'Failed to send message'
    });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { receiverId } = req.query;
    const senderId = req.userId;

    if (!senderId || !receiverId) {
      return res.status(400).json({
        message: 'Receiver is required'
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(receiverId)
    ) {
      return res.status(400).json({
        message: 'Invalid receiver ID'
      });
    }

    if (String(senderId) === String(receiverId)) {
      return res.status(400).json({
        message: 'Invalid conversation'
      });
    }

    const receiver =
      await User.findById(receiverId)
        .select('_id')
        .lean();

    if (!receiver) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    await Notification.updateMany(
      {
        receiverId: senderId,
        senderId: receiverId,
        type: 'message',
        isRead: false
      },
      {
        isRead: true
      }
    );

    const io = req.app.get('io');

    if (io) {
      io.to(`user_${senderId}`).emit(
        'notifications_read',
        {
          userId: senderId,
          senderId: receiverId
        }
      );
    }

    const messages = await Message.find({
      $or: [
        {
          senderId,
          receiverId
        },
        {
          senderId: receiverId,
          receiverId: senderId
        }
      ]
    })
      .sort({ createdAt: 1 })
      .limit(500)
      .populate('senderId', 'name')
      .populate('receiverId', 'name')
      .lean();

    res.json(messages);
  } catch (error) {
    console.error(
      'Get Messages Error:',
      error
    );

    res.status(500).json({
      message: 'Failed to load messages'
    });
  }
};

export const getConversations = async (
  req,
  res
) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        message: 'Authentication required'
      });
    }

    const messages =
      await Message.find({
        $or: [
          { senderId: userId },
          { receiverId: userId }
        ]
      })
        .sort({ createdAt: -1 })
        .limit(1000)
        .populate('senderId', 'name')
        .populate('receiverId', 'name')
        .lean();

    const conversationMap = new Map();

    for (const message of messages) {
      const messageSenderId =
        String(
          message.senderId?._id ||
          message.senderId
        );

      const messageReceiverId =
        String(
          message.receiverId?._id ||
          message.receiverId
        );

      const otherUserId =
        messageSenderId === String(userId)
          ? messageReceiverId
          : messageSenderId;

      if (!conversationMap.has(otherUserId)) {
        const otherUser =
          messageSenderId === String(userId)
            ? message.receiverId
            : message.senderId;

        conversationMap.set(
          otherUserId,
          {
            userId: otherUserId,
            name:
              otherUser?.name ||
              'Flatmate',
            lastMessage:
              message.text,
            lastMessageTime:
              message.createdAt
          }
        );
      }
    }

    const conversations =
      Array.from(
        conversationMap.values()
      );

    res.json({
      success: true,
      conversations
    });
  } catch (error) {
    console.error(
      'Get Conversations Error:',
      error
    );

    res.status(500).json({
      message:
        'Failed to load conversations'
    });
  }
};