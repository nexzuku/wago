import { errorResponse, ErrorCodes } from '../utils/response.js';

export const notFoundHandler = (req, res) => {
  return errorResponse(res, `Route ${req.originalUrl} not found`, ErrorCodes.NOT_FOUND, null, 404);
};

export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Multer upload errors (file too large, unexpected field, ...) are client errors
  if (err.name === 'MulterError') {
    const message = err.code === 'LIMIT_FILE_SIZE'
      ? 'File is too large'
      : `Upload failed: ${err.message}`;
    return errorResponse(res, message, ErrorCodes.VALIDATION_ERROR, null, 400);
  }

  // Rejections thrown from a multer fileFilter arrive as plain Errors
  if (/Only .* (are|is) allowed|Invalid file type/i.test(err.message || '')) {
    return errorResponse(res, err.message, ErrorCodes.VALIDATION_ERROR, null, 400);
  }

  // Blocked cross-origin request
  if (/not allowed by CORS/i.test(err.message || '')) {
    return errorResponse(res, err.message, ErrorCodes.FORBIDDEN, null, 403);
  }

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
