import mongoose from 'mongoose';

const pendingRegistrationSchema =
  new mongoose.Schema(
    {
      name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50
      },

      email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        maxlength: 100
      },

      password: {
        type: String,
        required: true
      },

      registrationOtpHash: {
        type: String,
        required: true
      },

      registrationOtpExpires: {
        type: Date,
        required: true
      },

      registrationOtpAttempts: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
      },

      registrationOtpLastSentAt: {
        type: Date,
        default: null
      }
    },
    {
      timestamps: true
    }
  );

const PendingRegistration =
  mongoose.model(
    'PendingRegistration',
    pendingRegistrationSchema
  );

export default PendingRegistration;