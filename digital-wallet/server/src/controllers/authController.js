import User from '../models/User.js';
import Wallet from '../models/Wallet.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getCookieConfig } from '../config/cors.js';

const clearRefreshCookie = (res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
  });
};

// @route POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const sanitizedEmail = email.toLowerCase().trim();
  const sanitizedName = name.trim().slice(0, 50);

  const userExists = await User.findOne({ email: sanitizedEmail });
  if (userExists) {
    return res.status(409).json({
      success: false,
      message: 'User already exists with this email',
    });
  }

  const user = await User.create({ name: sanitizedName, email: sanitizedEmail, password });

  await Wallet.create({ userId: user._id, balancePaise: 0, currency: 'INR' });

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  await user.save();

  res.cookie('refreshToken', refreshToken, getCookieConfig());

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: {
      user: { id: user._id, name: user.name, email: user.email },
      accessToken,
    },
  });
});

// @route POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const sanitizedEmail = email.toLowerCase().trim();

  const user = await User.findOne({ email: sanitizedEmail }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  if (!user.isActive) {
    return res.status(401).json({ success: false, message: 'Account is deactivated' });
  }

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  await user.save();

  res.cookie('refreshToken', refreshToken, getCookieConfig());

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: { id: user._id, name: user.name, email: user.email },
      accessToken,
    },
  });
});

// @route POST /api/auth/refresh
export const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ success: false, message: 'No refresh token provided' });
  }

  try {
    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.userId).select('+refreshToken');

    if (!user || user.refreshToken !== refreshToken) {
      if (user) { user.refreshToken = null; await user.save(); }
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Account is deactivated' });
    }

    // Rotate tokens
    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);
    user.refreshToken = newRefreshToken;
    await user.save();

    res.cookie('refreshToken', newRefreshToken, getCookieConfig());

    res.json({
      success: true,
      message: 'Token refreshed',
      data: { accessToken: newAccessToken },
    });
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }
});

// @route POST /api/auth/logout - works even with expired access token
export const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  clearRefreshCookie(res);

  if (refreshToken) {
    try {
      const decoded = verifyRefreshToken(refreshToken);
      if (decoded?.userId) {
        await User.findByIdAndUpdate(decoded.userId, { refreshToken: null });
      }
    } catch (err) {
      // Token expired/invalid - still cleared cookie, that's fine
    }
  }

  if (req.user?._id) {
    await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
  }

  res.json({ success: true, message: 'Logout successful' });
});

// @route GET /api/auth/me
export const getMe = asyncHandler(async (req, res) => {
  const wallet = await Wallet.findOne({ userId: req.user._id });

  res.json({
    success: true,
    data: {
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        createdAt: req.user.createdAt,
      },
      wallet: wallet
        ? { balance: wallet.balancePaise / 100, currency: wallet.currency }
        : null,
    },
  });
});
