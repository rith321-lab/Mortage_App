export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number,
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);

    // Set the prototype explicitly
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// Error types
export const ErrorTypes = {
  VALIDATION_ERROR: 'ValidationError',
  AUTHENTICATION_ERROR: 'AuthenticationError',
  AUTHORIZATION_ERROR: 'AuthorizationError',
  NOT_FOUND_ERROR: 'NotFoundError',
  DATABASE_ERROR: 'DatabaseError',
  EXTERNAL_SERVICE_ERROR: 'ExternalServiceError',
} as const;

// HTTP Status codes
export const HttpStatus = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// Helper functions to create specific error types
export const createValidationError = (message: string) => 
  new AppError(message, HttpStatus.BAD_REQUEST);

export const createAuthenticationError = (message: string) =>
  new AppError(message, HttpStatus.UNAUTHORIZED);

export const createAuthorizationError = (message: string) =>
  new AppError(message, HttpStatus.FORBIDDEN);

export const createNotFoundError = (message: string) =>
  new AppError(message, HttpStatus.NOT_FOUND);

export const createDatabaseError = (message: string) =>
  new AppError(message, HttpStatus.INTERNAL_SERVER_ERROR, false);

export const createExternalServiceError = (message: string) =>
  new AppError(message, HttpStatus.SERVICE_UNAVAILABLE, false); 