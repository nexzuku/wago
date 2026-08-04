export const successResponse = (res, data, meta = null, statusCode = 200) => {
  const response = {
    success: true,
    data
  };
  
  if (meta) {
    response.meta = meta;
  }
  
  return res.status(statusCode).json(response);
};

export const errorResponse = (res, message, code = 'ERROR', details = null, statusCode = 400) => {
  const response = {
    success: false,
    error: {
      code,
      message
    }
  };
  
  if (details) {
    response.error.details = details;
  }
  
  return res.status(statusCode).json(response);
};

export const paginatedResponse = (res, data, page, limit, total) => {
  return successResponse(res, data, {
    page: parseInt(page),
    limit: parseInt(limit),
    total,
    totalPages: Math.ceil(total / limit)
  });
};

// Error codes
export const ErrorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  RATE_LIMIT: 'RATE_LIMIT'
};
