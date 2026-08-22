import mongoose from 'mongoose';

const listingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    area: {
      type: String,
      required: true
    },
    rent: {
      type: Number,
      required: true
    },
    deposit: {
      type: Number,
      default: 0
    },
    roomType: {
      type: String,
      enum: ['single', 'shared'],
      default: 'shared'
    },
    description: {
      type: String,
      default: ''
    },
    isAvailable: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

const Listing = mongoose.model('Listing', listingSchema);
export default Listing;