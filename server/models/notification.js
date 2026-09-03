import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    type: {
      type: String,
      enum: ['message'],
      default: 'message'
    },

    message: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 200
    },

    isRead: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

const Notification =
  mongoose.model(
    'Notification',
    notificationSchema
  );

export default Notification;