import crypto from 'crypto';
import { Company, User, Topic } from '../models/index.js';
import { generateTokenPair, verifyRefreshToken } from '../utils/jwt.js';
import { successResponse, errorResponse, ErrorCodes } from '../utils/response.js';
import emailService from '../services/email.service.js';

export const register = async (req, res, next) => {
  try {
    const { 
      companyName, 
      industry, 
      address, 
      email, 
      password, 
      firstName, 
      lastName,
      introduction,
      selectedTopics,
      voiceAccent 
    } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return errorResponse(res, 'Email already registered', ErrorCodes.CONFLICT, null, 409);
    }

    // Generate unique slug
    let baseSlug = companyName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    let slug = baseSlug;
    let slugExists = await Company.findOne({ slug });
    while (slugExists) {
      slug = `${baseSlug}-${Math.random().toString(36).slice(2, 7)}`;
      slugExists = await Company.findOne({ slug });
    }

    // Create company
    const company = new Company({
      name: companyName,
      slug,
      industry,
      address,
      contactEmail: email,
      introduction,
      voiceProfile: {
        accent: voiceAccent || 'tokyo',
        status: 'pending'
      }
    });
    await company.save();

    // Create admin user
    const user = new User({
      companyId: company._id,
      email,
      role: 'admin',
      profile: {
        firstName,
        lastName
      },
      assignedTopics: selectedTopics || [],
      status: 'active'
    });
    await user.setPassword(password);
    await user.save();

    // Generate tokens
    const tokens = generateTokenPair(user);
    user.refreshTokens = [tokens.refreshToken];
    user.lastLoginAt = new Date();
    await user.save();

    // Send welcome email (async, don't wait)
    emailService.sendWelcome(email, firstName || 'Admin', companyName).catch(console.error);

    return successResponse(res, {
      user: user.toJSON(),
      company,
      ...tokens
    }, null, 201);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).populate('companyId');
    
    if (!user) {
      return errorResponse(res, 'Invalid email or password', ErrorCodes.UNAUTHORIZED, null, 401);
    }

    if (user.status === 'inactive') {
      return errorResponse(res, 'Account is inactive', ErrorCodes.FORBIDDEN, null, 403);
    }

    // Block login if invite has expired
    if (user.status === 'invited' && user.inviteExpiresAt && new Date() > user.inviteExpiresAt) {
      return errorResponse(res, 'Your invitation has expired. Please contact your administrator for a new invite.', ErrorCodes.FORBIDDEN, null, 403);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return errorResponse(res, 'Invalid email or password', ErrorCodes.UNAUTHORIZED, null, 401);
    }

    // Activate invited users on first successful login
    if (user.status === 'invited') {
      user.status = 'active';
    }

    // Generate tokens
    const tokens = generateTokenPair(user);
    
    // Store refresh token (keep last 5)
    user.refreshTokens = [tokens.refreshToken, ...(user.refreshTokens || [])].slice(0, 5);
    user.lastLoginAt = new Date();
    await user.save();

    return successResponse(res, {
      user: user.toJSON(),
      company: user.companyId,
      ...tokens
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    if (refreshToken && req.user) {
      req.user.refreshTokens = (req.user.refreshTokens || []).filter(t => t !== refreshToken);
      await req.user.save();
    }

    return successResponse(res, { message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return errorResponse(res, 'Invalid refresh token', ErrorCodes.UNAUTHORIZED, null, 401);
    }

    const user = await User.findById(decoded.userId).populate('companyId');
    
    if (!user || !user.refreshTokens?.includes(refreshToken)) {
      return errorResponse(res, 'Invalid refresh token', ErrorCodes.UNAUTHORIZED, null, 401);
    }

    if (user.status !== 'active') {
      return errorResponse(res, 'Account is inactive', ErrorCodes.FORBIDDEN, null, 403);
    }

    // Generate new tokens
    const tokens = generateTokenPair(user);
    
    // Replace old refresh token with new one
    user.refreshTokens = user.refreshTokens.map(t => t === refreshToken ? tokens.refreshToken : t);
    await user.save();

    return successResponse(res, tokens);
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    
    // Always return success to prevent email enumeration
    if (!user) {
      return successResponse(res, { message: 'If the email exists, reset instructions have been sent' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send email
    await emailService.sendPasswordReset(email, resetToken, user.profile?.firstName);

    return successResponse(res, { message: 'If the email exists, reset instructions have been sent' });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return errorResponse(res, 'Invalid or expired reset token', ErrorCodes.VALIDATION_ERROR, null, 400);
    }

    await user.setPassword(password);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.refreshTokens = []; // Invalidate all sessions
    await user.save();

    return successResponse(res, { message: 'Password reset successful' });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('companyId')
      .populate('assignedTopics');

    return successResponse(res, {
      user: user.toJSON(),
      company: user.companyId
    });
  } catch (error) {
    next(error);
  }
};
