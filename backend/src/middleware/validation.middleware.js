import { validationResult } from 'express-validator';
import { errorResponse, ErrorCodes } from '../utils/response.js';

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const details = errors.array().map(err => ({
      field: err.path,
      message: err.msg
    }));
    
    return errorResponse(res, 'Validation failed', ErrorCodes.VALIDATION_ERROR, details, 400);
  }
  
  next();
};
