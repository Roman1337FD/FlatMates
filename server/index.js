import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';

import connectDB from './config/db.js';
import matchRoutes from './routes/matchRoutes.js';
import authRoutes from './routes/authRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

dotenv.config();

if (!process.env.JWT_SECRET) {
  console.error(
    'JWT_SECRET is missing in .env'
  );

  process.exit(1);
}

if (!process.env.CLIENT_URL) {
  console.error(
    'CLIENT_URL is missing in .env'
  );

  process.exit(1);
}

const app = express();
const httpServer = createServer(app);

const allowedOrigin =
  process.env.CLIENT_URL;

const io = new Server(
  httpServer,
  {
    cors: {
      origin: allowedOrigin,
      methods: [
        'GET',
        'POST',
        'PUT',
        'DELETE'
      ]
    }
  }
);

const PORT =
  process.env.PORT || 5000;

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message:
      'Too many authentication attempts. Please try again later.'
  }
});

connectDB();

app.set('io', io);

app.disable('x-powered-by');

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: 'cross-origin'
    },

    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],

        imgSrc: [
          "'self'",
          'data:',
          'blob:',
          'http://localhost:5000'
        ],

        connectSrc: [
          "'self'",
          'http://localhost:5000',
          'ws://localhost:5000'
        ]
      }
    }
  })
);

app.use(
  cors({
    origin: allowedOrigin,
    methods: [
      'GET',
      'POST',
      'PUT',
      'DELETE'
    ]
  })
);

app.use(
  express.json({
    limit: '10kb'
  })
);

app.use(
  '/uploads',
  express.static('uploads')
);

app.use(
  '/api/auth/login',
  authLimiter
);

app.use(
  '/api/auth/register',
  authLimiter
);

app.use(
  '/api/auth',
  authRoutes
);

app.use(
  '/api/match',
  matchRoutes
);

app.use(
  '/api/chat',
  messageRoutes
);

app.use(
  '/api/notifications',
  notificationRoutes
);

app.use(
  '/api/upload',
  uploadRoutes
);

app.get(
  '/api/health',
  (req, res) => {
    res.json({
      status: 'ok',
      message:
        'Server is running smoothly!'
    });
  }
);

app.use(
  '/api',
  (req, res) => {
    res.status(404).json({
      message:
        'API endpoint not found'
    });
  }
);

app.use(
  (req, res) => {
    res.status(404).json({
      message:
        'Route not found'
    });
  }
);

app.use(
  (err, req, res, next) => {
    console.error(
      'Server Error:',
      err
    );

    if (
      err.type ===
      'entity.parse.failed'
    ) {
      return res.status(400).json({
        message:
          'Invalid JSON request'
      });
    }

    if (
      err.type ===
      'entity.too.large'
    ) {
      return res.status(413).json({
        message:
          'Request body is too large'
      });
    }

    if (
      err.message ===
      'Only JPG, PNG, WEBP and GIF images are allowed'
    ) {
      return res.status(400).json({
        message:
          err.message
      });
    }

    if (
      err.code ===
      'LIMIT_FILE_SIZE'
    ) {
      return res.status(413).json({
        message:
          'Image must be 5MB or less'
      });
    }

    res.status(
      err.statusCode || 500
    ).json({
      message:
        'Internal server error'
    });
  }
);

io.use(
  (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token;

      if (!token) {
        return next(
          new Error(
            'Authentication required'
          )
        );
      }

      const decoded =
        jwt.verify(
          token,
          process.env.JWT_SECRET
        );

      if (!decoded.userId) {
        return next(
          new Error(
            'Invalid authentication token'
          )
        );
      }

      socket.userId =
        decoded.userId;

      next();
    } catch (error) {
      console.error(
        'Socket Authentication Error:',
        error.message
      );

      next(
        new Error(
          'Invalid or expired token'
        )
      );
    }
  }
);

io.on(
  'connection',
  (socket) => {
    const userId =
      socket.userId;

    console.log(
      'Authenticated user connected:',
      userId
    );

    socket.join(
      `user_${userId}`
    );

    console.log(
      `User ${userId} joined their private room`
    );

    socket.on(
      'disconnect',
      () => {
        console.log(
          'User disconnected:',
          userId
        );
      }
    );
  }
);

httpServer.listen(
  PORT,
  () => {
    console.log(
      `Server running on port ${PORT}`
    );

    console.log(
      `Socket.IO running on port ${PORT}`
    );

    console.log(
      `CORS allowed origin: ${allowedOrigin}`
    );
  }
);