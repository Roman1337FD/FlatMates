import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

import User from '../models/user.js';
import PendingRegistration from '../models/pendingRegistration.js';

import {
  sendOtpEmail,
  sendPasswordResetOtpEmail
} from '../services/emailService.js';

const OTP_EXPIRY_MINUTES = 10;
const MAX_OTP_ATTEMPTS = 5;
const OTP_RESEND_COOLDOWN_MS =
  60 * 1000;

const generateOtp = () => {
  return crypto
    .randomInt(100000, 1000000)
    .toString();
};

const hashOtp = (otp) => {
  return crypto
    .createHash('sha256')
    .update(otp)
    .digest('hex');
};

const validatePassword = (password) => {
  if (
    typeof password !== 'string' ||
    password.length < 8 ||
    password.length > 16
  ) {
    return 'Password must be between 8 and 16 characters';
  }

  if (!/[A-Za-z]/.test(password)) {
    return 'Password must contain at least one letter';
  }

  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number';
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    return 'Password must contain at least one special character';
  }

  return null;
};

const createOtpData = () => {
  const otp = generateOtp();

  const otpHash =
    hashOtp(otp);

  const otpExpires =
    new Date(
      Date.now() +
        OTP_EXPIRY_MINUTES *
          60 *
          1000
    );

  return {
    otp,
    otpHash,
    otpExpires
  };
};

const createToken = (userId) => {
  return jwt.sign(
    {
      userId
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '7d'
    }
  );
};

export const registerUser = async (
  req,
  res
) => {
  try {
    const {
      name,
      email,
      password
    } = req.body;

    const cleanName =
      name?.trim();

    const cleanEmail =
      email
        ?.trim()
        .toLowerCase();

    if (
      !cleanName ||
      !cleanEmail ||
      !password
    ) {
      return res.status(400).json({
        message:
          'Name, email and password are required'
      });
    }

    if (cleanName.length > 50) {
      return res.status(400).json({
        message:
          'Name must be 50 characters or less'
      });
    }

    if (cleanEmail.length > 100) {
      return res.status(400).json({
        message:
          'Email must be 100 characters or less'
      });
    }

    const passwordError =
      validatePassword(password);

    if (passwordError) {
      return res.status(400).json({
        message: passwordError
      });
    }

    const existingUser =
      await User.findOne({
        email: cleanEmail
      });

    if (existingUser) {
      return res.status(409).json({
        message:
          'An account with this email already exists. Please login or use Forgot Password.'
      });
    }

    const existingPending =
      await PendingRegistration.findOne({
        email: cleanEmail
      });

    if (
      existingPending?.registrationOtpLastSentAt &&
      Date.now() -
        existingPending.registrationOtpLastSentAt.getTime() <
        OTP_RESEND_COOLDOWN_MS
    ) {
      const remainingSeconds =
        Math.ceil(
          (
            OTP_RESEND_COOLDOWN_MS -
            (
              Date.now() -
              existingPending.registrationOtpLastSentAt.getTime()
            )
          ) / 1000
        );

      return res.status(429).json({
        message:
          `Please wait ${remainingSeconds} seconds before requesting another OTP`
      });
    }

    const hashedPassword =
      await bcrypt.hash(
        password,
        12
      );

    const {
      otp,
      otpHash,
      otpExpires
    } = createOtpData();

    const pendingData = {
      name: cleanName,
      email: cleanEmail,
      password: hashedPassword,
      registrationOtpHash:
        otpHash,
      registrationOtpExpires:
        otpExpires,
      registrationOtpAttempts: 0,
      registrationOtpLastSentAt:
        new Date()
    };

    if (existingPending) {
      existingPending.name =
        pendingData.name;

      existingPending.password =
        pendingData.password;

      existingPending.registrationOtpHash =
        pendingData.registrationOtpHash;

      existingPending.registrationOtpExpires =
        pendingData.registrationOtpExpires;

      existingPending.registrationOtpAttempts =
        pendingData.registrationOtpAttempts;

      existingPending.registrationOtpLastSentAt =
        pendingData.registrationOtpLastSentAt;

      await existingPending.save();
    } else {
      await PendingRegistration.create(
        pendingData
      );
    }

    try {
      await sendOtpEmail(
        cleanEmail,
        otp
      );
    } catch (emailError) {
      console.error(
        'Registration OTP Email Error:',
        emailError
      );

      await PendingRegistration.deleteOne({
        email: cleanEmail
      });

      return res.status(500).json({
        message:
          'Unable to send OTP email. Please try again later.'
      });
    }

    return res.status(200).json({
      success: true,
      message:
        'Verification OTP sent to your email',
      email: cleanEmail
    });
  } catch (error) {
    console.error(
      'Register Error:',
      error
    );

    return res.status(500).json({
      message:
        'Registration failed'
    });
  }
};

export const verifyRegistrationOtp =
  async (req, res) => {
    try {
      const {
        email,
        otp
      } = req.body;

      const cleanEmail =
        email
          ?.trim()
          .toLowerCase();

      const cleanOtp =
        otp?.trim();

      if (
        !cleanEmail ||
        !cleanOtp
      ) {
        return res.status(400).json({
          message:
            'Email and OTP are required'
        });
      }

      if (
        !/^\d{6}$/.test(
          cleanOtp
        )
      ) {
        return res.status(400).json({
          message:
            'OTP must be 6 digits'
        });
      }

      const pending =
        await PendingRegistration.findOne({
          email: cleanEmail
        });

      if (!pending) {
        return res.status(400).json({
          message:
            'Invalid or expired OTP'
        });
      }

      const existingUser =
        await User.findOne({
          email: cleanEmail
        });

      if (existingUser) {
        await PendingRegistration.deleteOne({
          _id: pending._id
        });

        return res.status(409).json({
          message:
            'An account with this email already exists. Please login.'
        });
      }

      if (
        pending.registrationOtpAttempts >=
        MAX_OTP_ATTEMPTS
      ) {
        return res.status(429).json({
          message:
            'Too many incorrect OTP attempts. Please request a new OTP.'
        });
      }

      if (
        !pending.registrationOtpExpires ||
        pending.registrationOtpExpires.getTime() <
          Date.now()
      ) {
        await PendingRegistration.deleteOne({
          _id: pending._id
        });

        return res.status(400).json({
          message:
            'OTP has expired. Please register again.'
        });
      }

      const incomingHash =
        hashOtp(cleanOtp);

      if (
        incomingHash !==
        pending.registrationOtpHash
      ) {
        pending.registrationOtpAttempts +=
          1;

        await pending.save();

        return res.status(400).json({
          message:
            'Incorrect OTP'
        });
      }

      const user =
        await User.create({
          name: pending.name,
          email: pending.email,
          password: pending.password
        });

      await PendingRegistration.deleteOne({
        _id: pending._id
      });

      return res.status(200).json({
        success: true,
        message:
          'Email verified successfully. Account created.',
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        }
      });
    } catch (error) {
      console.error(
        'Verify Registration OTP Error:',
        error
      );

      return res.status(500).json({
        message:
          'OTP verification failed'
      });
    }
  };

export const resendRegistrationOtp =
  async (req, res) => {
    try {
      const {
        email
      } = req.body;

      const cleanEmail =
        email
          ?.trim()
          .toLowerCase();

      if (!cleanEmail) {
        return res.status(400).json({
          message:
            'Email is required'
        });
      }

      const pending =
        await PendingRegistration.findOne({
          email: cleanEmail
        });

      if (!pending) {
        return res.status(400).json({
          message:
            'No pending registration found for this email'
        });
      }

      const existingUser =
        await User.findOne({
          email: cleanEmail
        });

      if (existingUser) {
        await PendingRegistration.deleteOne({
          _id: pending._id
        });

        return res.status(409).json({
          message:
            'An account with this email already exists. Please login.'
        });
      }

      if (
        pending.registrationOtpLastSentAt &&
        Date.now() -
          pending.registrationOtpLastSentAt.getTime() <
          OTP_RESEND_COOLDOWN_MS
      ) {
        const remainingSeconds =
          Math.ceil(
            (
              OTP_RESEND_COOLDOWN_MS -
              (
                Date.now() -
                pending.registrationOtpLastSentAt.getTime()
              )
            ) / 1000
          );

        return res.status(429).json({
          message:
            `Please wait ${remainingSeconds} seconds before requesting another OTP`
        });
      }

      const {
        otp,
        otpHash,
        otpExpires
      } = createOtpData();

      pending.registrationOtpHash =
        otpHash;

      pending.registrationOtpExpires =
        otpExpires;

      pending.registrationOtpAttempts =
        0;

      pending.registrationOtpLastSentAt =
        new Date();

      await pending.save();

      try {
        await sendOtpEmail(
          cleanEmail,
          otp
        );
      } catch (emailError) {
        console.error(
          'Resend Registration OTP Email Error:',
          emailError
        );

        return res.status(500).json({
          message:
            'Unable to send OTP email'
        });
      }

      return res.status(200).json({
        success: true,
        message:
          'New verification OTP sent'
      });
    } catch (error) {
      console.error(
        'Resend Registration OTP Error:',
        error
      );

      return res.status(500).json({
        message:
          'Unable to resend OTP'
      });
    }
  };

export const loginUser = async (
  req,
  res
) => {
  try {
    const {
      email,
      password
    } = req.body;

    const cleanEmail =
      email
        ?.trim()
        .toLowerCase();

    if (
      !cleanEmail ||
      !password
    ) {
      return res.status(400).json({
        message:
          'Email and password are required'
      });
    }

    const user =
      await User.findOne({
        email: cleanEmail
      });

    if (!user) {
      return res.status(401).json({
        message:
          'Invalid email or password'
      });
    }

    const passwordMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!passwordMatch) {
      return res.status(401).json({
        message:
          'Invalid email or password'
      });
    }

    const token =
      createToken(user._id);

    return res.status(200).json({
      success: true,
      message:
        'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error(
      'Login Error:',
      error
    );

    return res.status(500).json({
      message:
        'Login failed'
    });
  }
};

export const forgotPassword =
  async (req, res) => {
    try {
      const {
        email
      } = req.body;

      const cleanEmail =
        email
          ?.trim()
          .toLowerCase();

      if (!cleanEmail) {
        return res.status(400).json({
          message:
            'Email is required'
        });
      }

      const user =
        await User.findOne({
          email: cleanEmail
        });

      if (!user) {
        return res.status(200).json({
          success: true,
          message:
            'If an account exists with this email, a password reset OTP has been sent.'
        });
      }

      if (
        user.passwordResetOtpLastSentAt &&
        Date.now() -
          user.passwordResetOtpLastSentAt.getTime() <
          OTP_RESEND_COOLDOWN_MS
      ) {
        return res.status(200).json({
          success: true,
          message:
            'If an account exists with this email, a password reset OTP has been sent.'
        });
      }

      const {
        otp,
        otpHash,
        otpExpires
      } = createOtpData();

      user.passwordResetOtpHash =
        otpHash;

      user.passwordResetOtpExpires =
        otpExpires;

      user.passwordResetOtpAttempts =
        0;

      user.passwordResetOtpLastSentAt =
        new Date();

      user.passwordResetVerified =
        false;

      await user.save();

      try {
        await sendPasswordResetOtpEmail(
          cleanEmail,
          otp
        );
      } catch (emailError) {
        console.error(
          'Password Reset OTP Email Error:',
          emailError
        );

        user.passwordResetOtpHash =
          null;

        user.passwordResetOtpExpires =
          null;

        user.passwordResetOtpAttempts =
          0;

        user.passwordResetOtpLastSentAt =
          null;

        user.passwordResetVerified =
          false;

        await user.save();

        return res.status(500).json({
          message:
            'Unable to send OTP email. Please try again later.'
        });
      }

      return res.status(200).json({
        success: true,
        message:
          'If an account exists with this email, a password reset OTP has been sent.',
        email: cleanEmail
      });
    } catch (error) {
      console.error(
        'Forgot Password Error:',
        error
      );

      return res.status(500).json({
        message:
          'Unable to process password reset request'
      });
    }
  };

export const verifyPasswordResetOtp =
  async (req, res) => {
    try {
      const {
        email,
        otp
      } = req.body;

      const cleanEmail =
        email
          ?.trim()
          .toLowerCase();

      const cleanOtp =
        otp?.trim();

      if (
        !cleanEmail ||
        !cleanOtp
      ) {
        return res.status(400).json({
          message:
            'Email and OTP are required'
        });
      }

      if (
        !/^\d{6}$/.test(
          cleanOtp
        )
      ) {
        return res.status(400).json({
          message:
            'OTP must be 6 digits'
        });
      }

      const user =
        await User.findOne({
          email: cleanEmail
        });

      if (
        !user ||
        !user.passwordResetOtpHash
      ) {
        return res.status(400).json({
          message:
            'Invalid or expired OTP'
        });
      }

      if (
        user.passwordResetOtpAttempts >=
        MAX_OTP_ATTEMPTS
      ) {
        return res.status(429).json({
          message:
            'Too many incorrect OTP attempts. Please request a new OTP.'
        });
      }

      if (
        !user.passwordResetOtpExpires ||
        user.passwordResetOtpExpires.getTime() <
          Date.now()
      ) {
        user.passwordResetOtpHash =
          null;

        user.passwordResetOtpExpires =
          null;

        user.passwordResetOtpAttempts =
          0;

        user.passwordResetVerified =
          false;

        await user.save();

        return res.status(400).json({
          message:
            'OTP has expired. Please request a new OTP.'
        });
      }

      const incomingHash =
        hashOtp(cleanOtp);

      if (
        incomingHash !==
        user.passwordResetOtpHash
      ) {
        user.passwordResetOtpAttempts +=
          1;

        await user.save();

        return res.status(400).json({
          message:
            'Incorrect OTP'
        });
      }

      user.passwordResetOtpHash =
        null;

      user.passwordResetOtpExpires =
        null;

      user.passwordResetOtpAttempts =
        0;

      user.passwordResetVerified =
        true;

      await user.save();

      return res.status(200).json({
        success: true,
        message:
          'OTP verified successfully. You can now create a new password.'
      });
    } catch (error) {
      console.error(
        'Verify Password Reset OTP Error:',
        error
      );

      return res.status(500).json({
        message:
          'OTP verification failed'
      });
    }
  };

export const resendPasswordResetOtp =
  async (req, res) => {
    try {
      const {
        email
      } = req.body;

      const cleanEmail =
        email
          ?.trim()
          .toLowerCase();

      if (!cleanEmail) {
        return res.status(400).json({
          message:
            'Email is required'
        });
      }

      const user =
        await User.findOne({
          email: cleanEmail
        });

      if (!user) {
        return res.status(200).json({
          success: true,
          message:
            'If an account exists with this email, a new password reset OTP has been sent.'
        });
      }

      if (
        user.passwordResetOtpLastSentAt &&
        Date.now() -
          user.passwordResetOtpLastSentAt.getTime() <
          OTP_RESEND_COOLDOWN_MS
      ) {
        return res.status(200).json({
          success: true,
          message:
            'If an account exists with this email, a new password reset OTP has been sent.'
        });
      }

      const {
        otp,
        otpHash,
        otpExpires
      } = createOtpData();

      user.passwordResetOtpHash =
        otpHash;

      user.passwordResetOtpExpires =
        otpExpires;

      user.passwordResetOtpAttempts =
        0;

      user.passwordResetOtpLastSentAt =
        new Date();

      user.passwordResetVerified =
        false;

      await user.save();

      try {
        await sendPasswordResetOtpEmail(
          cleanEmail,
          otp
        );
      } catch (emailError) {
        console.error(
          'Resend Password Reset OTP Email Error:',
          emailError
        );

        return res.status(500).json({
          message:
            'Unable to send OTP email'
        });
      }

      return res.status(200).json({
        success: true,
        message:
          'New password reset OTP sent'
      });
    } catch (error) {
      console.error(
        'Resend Password Reset OTP Error:',
        error
      );

      return res.status(500).json({
        message:
          'Unable to resend OTP'
      });
    }
  };

export const resetPassword =
  async (req, res) => {
    try {
      const {
        email,
        password
      } = req.body;

      const cleanEmail =
        email
          ?.trim()
          .toLowerCase();

      if (
        !cleanEmail ||
        !password
      ) {
        return res.status(400).json({
          message:
            'Email and new password are required'
        });
      }

      const passwordError =
        validatePassword(password);

      if (passwordError) {
        return res.status(400).json({
          message: passwordError
        });
      }

      const user =
        await User.findOne({
          email: cleanEmail
        });

      if (!user) {
        return res.status(400).json({
          message:
            'Password reset session is invalid'
        });
      }

      if (
        user.passwordResetVerified !==
        true
      ) {
        return res.status(400).json({
          message:
            'Please verify the OTP first'
        });
      }

      const samePassword =
        await bcrypt.compare(
          password,
          user.password
        );

      if (samePassword) {
        return res.status(400).json({
          message:
            'New password must be different from your old password'
        });
      }

      user.password =
        await bcrypt.hash(
          password,
          12
        );

      user.passwordResetOtpHash =
        null;

      user.passwordResetOtpExpires =
        null;

      user.passwordResetOtpAttempts =
        0;

      user.passwordResetOtpLastSentAt =
        null;

      user.passwordResetVerified =
        false;

      await user.save();

      return res.status(200).json({
        success: true,
        message:
          'Password reset successfully. Please login with your new password.'
      });
    } catch (error) {
      console.error(
        'Reset Password Error:',
        error
      );

      return res.status(500).json({
        message:
          'Unable to reset password'
      });
    }
  };

export const getUsers = async (
  req,
  res
) => {
  try {
    const currentUserId =
      req.userId;

    const users =
      await User.find({
        _id: {
          $ne: currentUserId
        }
      })
        .select(
          'name email gender profession targetArea budgetMin budgetMax sleepSchedule foodPref smoking cleanliness bio'
        )
        .lean();

    return res.json(users);
  } catch (error) {
    console.error(
      'Get Users Error:',
      error
    );

    return res.status(500).json({
      message:
        'Failed to load users'
    });
  }
};

export const getProfile = async (
  req,
  res
) => {
  try {
    const requestedUserId =
      req.params.userId;

    if (
      String(requestedUserId) !==
      String(req.userId)
    ) {
      return res.status(403).json({
        message:
          'You can only access your own profile'
      });
    }

    const user =
      await User.findById(
        requestedUserId
      )
        .select('-password')
        .lean();

    if (!user) {
      return res.status(404).json({
        message:
          'User not found'
      });
    }

    return res.json(user);
  } catch (error) {
    console.error(
      'Get Profile Error:',
      error
    );

    return res.status(500).json({
      message:
        'Failed to load profile'
    });
  }
};

export const getPublicProfile =
  async (req, res) => {
    try {
      const user =
        await User.findById(
          req.params.userId
        )
          .select(
            'name gender profession targetArea budgetMin budgetMax sleepSchedule foodPref smoking cleanliness bio'
          )
          .lean();

      if (!user) {
        return res.status(404).json({
          message:
            'User not found'
        });
      }

      return res.json(user);
    } catch (error) {
      console.error(
        'Get Public Profile Error:',
        error
      );

      return res.status(500).json({
        message:
          'Failed to load public profile'
      });
    }
  };

export const updateProfile =
  async (req, res) => {
    try {
      const userId =
        req.params.userId;

      if (
        String(userId) !==
        String(req.userId)
      ) {
        return res.status(403).json({
          message:
            'You can only update your own profile'
        });
      }

      const allowedFields = [
        'name',
        'gender',
        'profession',
        'targetArea',
        'budgetMin',
        'budgetMax',
        'sleepSchedule',
        'foodPref',
        'smoking',
        'cleanliness',
        'bio'
      ];

      const updates = {};

      for (
        const field of allowedFields
      ) {
        if (
          req.body[field] !==
          undefined
        ) {
          updates[field] =
            req.body[field];
        }
      }

      if (
        updates.name !==
        undefined
      ) {
        updates.name =
          String(
            updates.name
          ).trim();

        if (
          !updates.name
        ) {
          return res.status(400).json({
            message:
              'Name cannot be empty'
          });
        }

        if (
          updates.name.length >
          50
        ) {
          return res.status(400).json({
            message:
              'Name must be 50 characters or less'
          });
        }
      }

      if (
        updates.profession !==
        undefined
      ) {
        updates.profession =
          String(
            updates.profession
          ).trim();

        if (
          updates.profession.length >
          50
        ) {
          return res.status(400).json({
            message:
              'Profession must be 50 characters or less'
          });
        }
      }

      if (
        updates.targetArea !==
        undefined
      ) {
        updates.targetArea =
          String(
            updates.targetArea
          ).trim();

        if (
          !updates.targetArea
        ) {
          return res.status(400).json({
            message:
              'Target area is required'
          });
        }

        if (
          updates.targetArea.length >
          100
        ) {
          return res.status(400).json({
            message:
              'Target area must be 100 characters or less'
          });
        }
      }

      if (
        updates.bio !==
        undefined
      ) {
        updates.bio =
          String(
            updates.bio
          ).trim();

        if (
          updates.bio.length >
          500
        ) {
          return res.status(400).json({
            message:
              'Bio must be 500 characters or less'
          });
        }
      }

      if (
        updates.budgetMin !==
        undefined
      ) {
        updates.budgetMin =
          Number(
            updates.budgetMin
          );

        if (
          !Number.isFinite(
            updates.budgetMin
          ) ||
          updates.budgetMin < 0
        ) {
          return res.status(400).json({
            message:
              'Invalid minimum budget'
          });
        }
      }

      if (
        updates.budgetMax !==
        undefined
      ) {
        updates.budgetMax =
          Number(
            updates.budgetMax
          );

        if (
          !Number.isFinite(
            updates.budgetMax
          ) ||
          updates.budgetMax < 0
        ) {
          return res.status(400).json({
            message:
              'Invalid maximum budget'
          });
        }
      }

      const currentUser =
        await User.findById(
          userId
        );

      if (!currentUser) {
        return res.status(404).json({
          message:
            'User not found'
        });
      }

      const finalBudgetMin =
        updates.budgetMin !==
        undefined
          ? updates.budgetMin
          : currentUser.budgetMin;

      const finalBudgetMax =
        updates.budgetMax !==
        undefined
          ? updates.budgetMax
          : currentUser.budgetMax;

      if (
        finalBudgetMin >
        finalBudgetMax
      ) {
        return res.status(400).json({
          message:
            'Minimum budget cannot exceed maximum budget'
        });
      }

      const updatedUser =
        await User.findByIdAndUpdate(
          userId,
          {
            $set: updates
          },
          {
            new: true,
            runValidators: true
          }
        )
          .select('-password')
          .lean();

      return res.json({
        success: true,
        message:
          'Profile updated successfully',
        user: updatedUser
      });
    } catch (error) {
      console.error(
        'Update Profile Error:',
        error
      );

      return res.status(500).json({
        message:
          'Failed to update profile'
      });
    }
  };