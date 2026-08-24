import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';

export const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      gender,
      profession
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Name, email and password are required'
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: 'User already exists'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      gender: gender || 'male',
      profession: profession || 'student'
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      userId: user._id
    });
  } catch (error) {
    console.error('Register Error:', error);

    res.status(500).json({
      message: 'Registration failed',
      error: error.message
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required'
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'flatmate_secret',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        gender: user.gender,
        profession: user.profession
      }
    });
  } catch (error) {
    console.error('Login Error:', error);

    res.status(500).json({
      message: 'Login failed',
      error: error.message
    });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');

    res.json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Get Users Error:', error);

    res.status(500).json({
      message: 'Failed to fetch users'
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const {
      name,
      gender,
      profession,
      targetArea,
      budgetMin,
      budgetMax,
      sleepSchedule,
      foodPref,
      smoking,
      cleanliness,
      bio
    } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        name,
        gender,
        profession,
        targetArea,
        budgetMin,
        budgetMax,
        sleepSchedule,
        foodPref,
        smoking,
        cleanliness,
        bio
      },
      {
        new: true,
        runValidators: true
      }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Profile Update Error:', error);

    res.status(500).json({
      message: 'Failed to update profile',
      error: error.message
    });
  }
};