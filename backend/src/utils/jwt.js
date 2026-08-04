import jwt from 'jsonwebtoken';
import config from '../config/env.js';

export const generateAccessToken = (payload) => {
  return jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpires
  });
};

export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpires
  });
};

export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.accessSecret);
  } catch (error) {
    return null;
  }
};

export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.refreshSecret);
  } catch (error) {
    return null;
  }
};

export const generateTokenPair = (user) => {
  const payload = {
    userId: user._id,
    companyId: user.companyId,
    role: user.role,
    email: user.email
  };
  
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken({ userId: user._id })
  };
};
