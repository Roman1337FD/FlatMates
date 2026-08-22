import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      default: 'male'
    },
    profession: {
      type: String,
      default: 'student'
    },
    targetArea: {
      type: String,
      required: true,
      default: 'Knowledge Park II'
    },
    budgetMin: {
      type: Number,
      required: true,
      default: 5000
    },
    budgetMax: {
      type: Number,
      required: true,
      default: 12000
    },
    sleepSchedule: {
      type: String,
      enum: ['early-bird', 'night-owl', 'flexible'],
      default: 'night-owl'
    },
    foodPref: {
      type: String,
      enum: ['veg', 'non-veg', 'vegan'],
      default: 'veg'
    },
    smoking: {
      type: String,
      enum: ['no', 'yes', 'occasionally'],
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
      default: ''
    }
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);
export default User;