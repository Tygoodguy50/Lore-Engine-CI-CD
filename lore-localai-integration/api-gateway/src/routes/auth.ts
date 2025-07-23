import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { logger } from '../utils/logger';

const router = Router();

// Mock user database
const users = new Map([
  ['admin@example.com', {
    id: 'user_1',
    email: 'admin@example.com',
    password: 'hashed_password_1', // In real app, use bcrypt
    role: 'admin',
    tier: 'enterprise',
    createdAt: '2024-01-01T00:00:00Z',
  }],
  ['user@example.com', {
    id: 'user_2',
    email: 'user@example.com',
    password: 'hashed_password_2',
    role: 'user',
    tier: 'free',
    createdAt: '2024-01-02T00:00:00Z',
  }],
]);

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Email and password are required',
          code: 'INVALID_INPUT',
        },
      });
    }

    // Find user
    const user = users.get(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS',
        },
      });
    }

    // In real app, use bcrypt.compare
    if (password !== 'password') {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS',
        },
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        tier: user.tier,
      },
      config.security.jwt.secret,
      { 
        expiresIn: config.security.jwt.expiresIn,
        issuer: config.security.jwt.issuer,
      }
    );

    logger.info('User logged in:', {
      userId: user.id,
      email: user.email,
      role: user.role,
      tier: user.tier,
    });

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          tier: user.tier,
        },
      },
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Login failed',
        code: 'LOGIN_ERROR',
      },
    });
  }
});

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { email, password, role = 'user', tier = 'free' } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Email and password are required',
          code: 'INVALID_INPUT',
        },
      });
    }

    // Check if user already exists
    if (users.has(email)) {
      return res.status(409).json({
        success: false,
        error: {
          message: 'User already exists',
          code: 'USER_EXISTS',
        },
      });
    }

    // Create new user
    const newUser = {
      id: `user_${Date.now()}`,
      email,
      password: password, // In real app, use bcrypt.hash
      role,
      tier,
      createdAt: new Date().toISOString(),
    };

    users.set(email, newUser);

    // Generate JWT token
    const token = jwt.sign(
      {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        tier: newUser.tier,
      },
      config.security.jwt.secret,
      { 
        expiresIn: config.security.jwt.expiresIn,
        issuer: config.security.jwt.issuer,
      }
    );

    logger.info('User registered:', {
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
      tier: newUser.tier,
    });

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: newUser.id,
          email: newUser.email,
          role: newUser.role,
          tier: newUser.tier,
        },
      },
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Registration failed',
        code: 'REGISTRATION_ERROR',
      },
    });
  }
});

// Get current user profile
router.get('/profile', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'No token provided',
          code: 'NO_TOKEN',
        },
      });
    }

    const decoded = jwt.verify(token, config.security.jwt.secret) as any;
    const user = Array.from(users.values()).find(u => u.id === decoded.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'User not found',
          code: 'USER_NOT_FOUND',
        },
      });
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        role: user.role,
        tier: user.tier,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    logger.error('Profile error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to retrieve profile',
        code: 'PROFILE_ERROR',
      },
    });
  }
});

// Update user profile
router.put('/profile', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'No token provided',
          code: 'NO_TOKEN',
        },
      });
    }

    const decoded = jwt.verify(token, config.security.jwt.secret) as any;
    const user = Array.from(users.values()).find(u => u.id === decoded.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'User not found',
          code: 'USER_NOT_FOUND',
        },
      });
    }

    const { email, role, tier } = req.body;

    // Update user (in real app, validate permissions)
    if (email) user.email = email;
    if (role) user.role = role;
    if (tier) user.tier = tier;

    logger.info('User profile updated:', {
      userId: user.id,
      email: user.email,
      role: user.role,
      tier: user.tier,
    });

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        role: user.role,
        tier: user.tier,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    logger.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to update profile',
        code: 'PROFILE_UPDATE_ERROR',
      },
    });
  }
});

// Refresh token endpoint
router.post('/refresh', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'No token provided',
          code: 'NO_TOKEN',
        },
      });
    }

    const decoded = jwt.verify(token, config.security.jwt.secret) as any;
    const user = Array.from(users.values()).find(u => u.id === decoded.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'User not found',
          code: 'USER_NOT_FOUND',
        },
      });
    }

    // Generate new token
    const newToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        tier: user.tier,
      },
      config.security.jwt.secret,
      { 
        expiresIn: config.security.jwt.expiresIn,
        issuer: config.security.jwt.issuer,
      }
    );

    logger.info('Token refreshed:', {
      userId: user.id,
      email: user.email,
    });

    res.json({
      success: true,
      data: {
        token: newToken,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          tier: user.tier,
        },
      },
    });
  } catch (error) {
    logger.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Token refresh failed',
        code: 'TOKEN_REFRESH_ERROR',
      },
    });
  }
});

export default router;
