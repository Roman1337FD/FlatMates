import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
      minlength: 4,
      maxlength: 30,
      match: /^[a-z0-9_]+$/
    },

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

    profileImage: {
      type: String,
      trim: true,
      default: ''
    },

    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      default: 'male'
    },

    profession: {
      type: String,
      trim: true,
      maxlength: 50,
      default: 'student'
    },

    targetArea: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
      default: 'Knowledge Park II'
    },

    budgetMin: {
      type: Number,
      required: true,
      min: 0,
      default: 5000
    },

    budgetMax: {
      type: Number,
      required: true,
      min: 0,
      default: 12000
    },

    sleepSchedule: {
      type: String,
      enum: [
        'early-bird',
        'night-owl',
        'flexible'
      ],
      default: 'night-owl'
    },

    foodPref: {
      type: String,
      enum: [
        'veg',
        'non-veg',
        'vegan'
      ],
      default: 'veg'
    },

    smoking: {
      type: String,
      enum: [
        'no',
        'yes',
        'occasionally'
      ],
      default: 'no'
    },

    cleanliness: {
      type: Number,
      min: 1,
      max: 5,
      default: 4
    },

    bio: {
      type: String,
      trim: true,
      maxlength: 500,
      default: ''
    },

    registrationOtpHash: {
      type: String,
      default: null
    },

    registrationOtpExpires: {
      type: Date,
      default: null
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
    },

    passwordResetOtpHash: {
      type: String,
      default: null
    },

    passwordResetOtpExpires: {
      type: Date,
      default: null
    },

    passwordResetOtpAttempts: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },

    passwordResetOtpLastSentAt: {
      type: Date,
      default: null
    },

    passwordResetVerified: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

userSchema.pre(
  'validate',
  function () {
    if (
      this.budgetMin !== undefined &&
      this.budgetMax !== undefined &&
      this.budgetMin > this.budgetMax
    ) {
      this.invalidate(
        'budgetMin',
        'Minimum budget cannot exceed maximum budget'
      );
    }
  }
);

const User =
  mongoose.model(
    'User',
    userSchema
  );

export default User;