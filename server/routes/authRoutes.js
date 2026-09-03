import express from 'express';

import {
  registerUser,
  verifyRegistrationOtp,
  resendRegistrationOtp,
  loginUser,
  forgotPassword,
  verifyPasswordResetOtp,
  resendPasswordResetOtp,
  resetPassword,
  getUsers,
  getProfile,
  getPublicProfile,
  updateProfile
} from '../controllers/authControllers.js';

import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.post(
  '/register',
  registerUser
);

router.post(
  '/register/verify-otp',
  verifyRegistrationOtp
);

router.post(
  '/register/resend-otp',
  resendRegistrationOtp
);

router.post(
  '/login',
  loginUser
);

router.post(
  '/forgot-password',
  forgotPassword
);

router.post(
  '/forgot-password/verify-otp',
  verifyPasswordResetOtp
);

router.post(
  '/forgot-password/resend-otp',
  resendPasswordResetOtp
);

router.post(
  '/forgot-password/reset',
  resetPassword
);

router.get(
  '/users',
  protect,
  getUsers
);

router.get(
  '/profile/:userId',
  protect,
  getProfile
);

router.get(
  '/public-profile/:userId',
  protect,
  getPublicProfile
);

router.put(
  '/profile/:userId',
  protect,
  updateProfile
);

export default router;