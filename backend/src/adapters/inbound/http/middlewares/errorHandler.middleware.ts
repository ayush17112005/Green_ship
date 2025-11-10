// Import Express types
import { Request, Response, NextFunction } from 'express';

/**
 * Custom Error Interface
 * 
 * Extends the built-in Error class with additional properties
 */
export interface ApiError extends Error {
  statusCode?: number;        // HTTP status code (404, 500, etc.)
  isOperational?: boolean;    // Is this a known error or a bug?
}

/**
 * Global Error Handler Middleware
 * 
 * This catches ALL errors in your Express app.
 * It must be the LAST middleware in main.ts!
 * 
 * How it works:
 * 1. Any route throws an error
 * 2. Express catches it
 * 3. Sends it to this function
 * 4. We return a nice JSON response
 * 
 * @param err - The error object
 * @param req - Express request
 * @param res - Express response
 * @param next - Express next function (not used here)
 */
export const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  
  // Get status code from error, or default to 500 (Internal Server Error)
  const statusCode = err.statusCode || 500;
  
  // Get error message, or default generic message
  const message = err.message || 'Internal Server Error';

  // Log the error to console (for debugging)
  console.error('❌ Error occurred:', {
    statusCode: statusCode,
    message: message,
    stack: err.stack,          // Shows where the error happened
    path: req.path,             // Which endpoint caused it
    method: req.method,         // GET, POST, etc.
    timestamp: new Date().toISOString(),
  });

  // Send error response to client
  res.status(statusCode).json({
    success: false,
    error: {
      message: message,
      statusCode: statusCode,
      // Only show stack trace in development (not in production!)
      ...(process.env.NODE_ENV === 'development' && { 
        stack: err.stack 
      }),
    },
  });
};