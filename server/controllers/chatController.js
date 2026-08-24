import Message from '../models/messages.js';

export const getMessages = async (req, res) => {
  try {
    const { senderId, receiverId } = req.query;

    const messages = await Message.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId }
      ]
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    console.error('Get Messages Error:', error);

    res.status(500).json({
      message: 'Failed to fetch messages'
    });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { senderId, receiverId, text } = req.body;

    if (!senderId || !receiverId || !text) {
      return res.status(400).json({
        message: 'senderId, receiverId and text are required'
      });
    }

    const message = await Message.create({
      senderId,
      receiverId,
      text
    });

    res.status(201).json(message);
  } catch (error) {
    console.error('Send Message Error:', error);

    res.status(500).json({
      message: 'Failed to send message'
    });
  }
};