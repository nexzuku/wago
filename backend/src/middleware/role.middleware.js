import { errorResponse, ErrorCodes } from '../utils/response.js';

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Authentication required', ErrorCodes.UNAUTHORIZED, null, 401);
    }
    
    if (!roles.includes(req.user.role)) {
      return errorResponse(
        res, 
        `Access denied. Required role: ${roles.join(' or ')}`, 
        ErrorCodes.FORBIDDEN, 
        null, 
        403
      );
    }
    
    next();
  };
};

export const requireAdmin = requireRole('admin');
export const requireManager = requireRole('admin', 'manager');
export const requireEmployee = requireRole('admin', 'manager', 'employee');
