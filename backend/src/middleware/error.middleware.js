import { errorResponse, ErrorCodes } from '../utils/response.js';

export const notFoundHandler = (req, res) => {
  return errorResponse(res, `Route ${req.originalUrl} not found`, ErrorCodes.NOT_FOUND, null, 404);
};

export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message
    }));
    return errorResponse(res, 'Validation failed', ErrorCodes.VALIDATION_ERROR, details, 400);
  }
  
  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return errorResponse(res, `${field} already exists`, ErrorCodes.CONFLICT, null, 409);
  }
  
  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    return errorResponse(res, `Invalid ${err.path}: ${err.value}`, ErrorCodes.VALIDATION_ERROR, null, 400);
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return errorResponse(res, 'Invalid token', ErrorCodes.UNAUTHORIZED, null, 401);
  }
  
  if (err.name === 'TokenExpiredError') {
    return errorResponse(res, 'Token expired', ErrorCodes.UNAUTHORIZED, null, 401);
  }
  
  // Default error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  
  return errorResponse(
    res, 
    process.env.NODE_ENV === 'production' ? 'Internal server error' : message, 
    ErrorCodes.INTERNAL_ERROR, 
    null, 
    statusCode
  );
};
