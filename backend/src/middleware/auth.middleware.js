import { verifyAccessToken } from '../utils/jwt.js';
import { errorResponse, ErrorCodes } from '../utils/response.js';
import { User } from '../models/index.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Access token required', ErrorCodes.UNAUTHORIZED, null, 401);
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);
    
    if (!decoded) {
      return errorResponse(res, 'Invalid or expired token', ErrorCodes.UNAUTHORIZED, null, 401);
    }
    
    const user = await User.findById(decoded.userId).populate('companyId');
    
    if (!user) {
      return errorResponse(res, 'User not found', ErrorCodes.UNAUTHORIZED, null, 401);
    }
    
    if (user.status !== 'active') {
      return errorResponse(res, 'Account is inactive', ErrorCodes.FORBIDDEN, null, 403);
    }
    
    req.user = user;
    req.companyId = user.companyId._id;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return errorResponse(res, 'Authentication failed', ErrorCodes.UNAUTHORIZED, null, 401);
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyAccessToken(token);
      
      if (decoded) {
        const user = await User.findById(decoded.userId).populate('companyId');
        if (user && user.status === 'active') {
          req.user = user;
          req.companyId = user.companyId._id;
        }
      }
    }
    
    next();
  } catch (error) {
    next();
  }
};
