import express from 'express';
import protect from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post(
  '/profile-image',
  protect,
  upload.single('profileImage'),
  (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          message:
            'Please select an image'
        });
      }

      const imageUrl =
        `/uploads/${req.file.filename}`;

      return res.status(200).json({
        success: true,
        message:
          'Profile image uploaded successfully',
        imageUrl
      });
    } catch (error) {
      console.error(
        'Profile Image Upload Error:',
        error
      );

      return res.status(500).json({
        message:
          'Failed to upload profile image'
      });
    }
  }
);

export default router;