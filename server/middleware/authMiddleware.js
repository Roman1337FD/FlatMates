import jwt from 'jsonwebtoken';

const protect = (req, res, next) => {
  try {
    if (!process.env.JWT_SECRET) {
      console.error(
        'JWT_SECRET is missing in .env'
      );

      return res.status(500).json({
        message:
          'Server authentication is not configured'
      });
    }

    const authHeader =
      req.headers.authorization;

    if (
      !authHeader ||
      !authHeader.startsWith('Bearer ')
    ) {
      return res.status(401).json({
        message:
          'Authentication required'
      });
    }

    const token =
      authHeader.slice(7).trim();

    if (!token) {
      return res.status(401).json({
        message:
          'Authentication required'
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (!decoded.userId) {
      return res.status(401).json({
        message:
          'Invalid authentication token'
      });
    }

    req.userId = decoded.userId;

    next();
  } catch (error) {
    if (
      error.name === 'TokenExpiredError'
    ) {
      return res.status(401).json({
        message:
          'Session expired. Please login again.'
      });
    }

    if (
      error.name === 'JsonWebTokenError'
    ) {
      return res.status(401).json({
        message:
          'Invalid authentication token'
      });
    }

    console.error(
      'Authentication Error:',
      error
    );

    return res.status(401).json({
      message:
        'Authentication failed'
    });
  }
};

export default protect;