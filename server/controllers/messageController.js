import Message from '../models/messages.js';
import Notification from '../models/notification.js';
import User from '../models/user.js';

export const sendMessage = async (req, res) => {
  try {
    const { senderId, receiverId, text } = req.body;

    if (!senderId || !receiverId || !text?.trim()) {
      return res.status(400).json({
        message: 'Sender, receiver and message are required'
      });
    }

    const message = await Message.create({
      senderId,
      receiverId,
      text: text.trim()
    });

    const sender = await User.findById(senderId).select(
      'name email'
    );

    await Notification.create({
      receiverId,
      senderId,
      type: 'message',
      message: `${sender?.name || 'Someone'} sent you a message`
    });

    const result = await Message.findById(message._id)
      .populate('senderId', 'name email')
      .populate('receiverId', 'name email');

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
          message: `${sender?.name || 'Someone'} sent you a message`,
          createdAt: new Date()
        }
      );
    }

    res.status(201).json(result);
  } catch (error) {
    console.error('Send Message Error:', error);

    res.status(500).json({
      message: 'Failed to send message',
      error: error.message
    });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { senderId, receiverId } = req.query;

    if (!senderId || !receiverId) {
      return res.status(400).json({
        message: 'Sender and receiver are required'
      });
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
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    console.error('Get Messages Error:', error);

    res.status(500).json({
      message: 'Failed to load messages',
      error: error.message
    });
  }
};

export const getConversations = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        message: 'User ID is required'
      });
    }

    const messages = await Message.find({
      $or: [
        { senderId: userId },
        { receiverId: userId }
      ]
    })
      .sort({ createdAt: -1 })
      .populate('senderId', 'name email')
      .populate('receiverId', 'name email');

    const conversationMap = new Map();

    for (const message of messages) {
      const messageSenderId = String(
        message.senderId?._id || message.senderId
      );

      const messageReceiverId = String(
        message.receiverId?._id || message.receiverId
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

        conversationMap.set(otherUserId, {
          userId: otherUserId,
          name: otherUser?.name || 'Flatmate',
          email: otherUser?.email || '',
          lastMessage: message.text,
          lastMessageTime: message.createdAt
        });
      }
    }

    const conversations = Array.from(
      conversationMap.values()
    );

    res.json({
      success: true,
      conversations
    });
  } catch (error) {
    console.error('Get Conversations Error:', error);

    res.status(500).json({
      message: 'Failed to load conversations'
    });
  }
};