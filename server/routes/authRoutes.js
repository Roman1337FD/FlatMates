import express from 'express';

import {
  registerUser,
  loginUser,
  getUsers,
  updateProfile
} from '../controllers/authControllers.js';

const router = express.Router();

router.post('/register', registerUser);

router.post('/login', loginUser);

router.get('/users', getUsers);

router.put('/profile/:userId', updateProfile);

export default router;