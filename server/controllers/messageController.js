import Message from '../models/messages.js';
import Notification from '../models/notification.js';

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

    const sender = await import('../models/user.js').then(
      (module) => module.default.findById(senderId).select('name email')
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