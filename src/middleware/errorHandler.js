// Custom error handler for expected errors
class AppError extends Error {
    constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode;
      this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
      this.isOperational = true;
      
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  // Middleware to handle errors
  const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    
    // Development environment: send detailed error
    if (process.env.NODE_ENV === 'development') {
      res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
      });
    } 
    // Production environment: send friendly error
    else {
      // Operational, trusted error: send message to client
      if (err.isOperational) {
        res.status(err.statusCode).json({
          status: err.status,
          message: err.message
        });
      } 
      // Programming or unknown error: don't leak error details
      else {
        console.error('ERROR 💥', err);
        res.status(500).json({
          status: 'error',
          message: 'Something went wrong'
        });
      }
    }
  };
  
  // Middleware to handle unhandled routes
  const notFoundHandler = (req, res, next) => {
    const error = new AppError(`Cannot find ${req.method} ${req.originalUrl} on this server`, 404);
    next(error);
  };
  
  // Middleware to handle async errors
  const catchAsync = (fn) => {
    return (req, res, next) => {
      fn(req, res, next).catch(next);
    };
  };
  
  module.exports = {
    AppError,
    errorHandler,
    notFoundHandler,
    catchAsync
  };