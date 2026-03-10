export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  console.error('Error:', err);

  if (err.name === 'CastError') {
    error = { message: 'Resource not found', statusCode: 404 };
  }

  if (err.code === 11000) {
    error = { message: 'Duplicate field value entered', statusCode: 400 };
  }

  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val) => val.message);
    error = { message, statusCode: 400 };
  }

  if (err.name === 'JsonWebTokenError') {
    error = { message: 'Invalid token', statusCode: 401 };
  }

  // Hide stack in production
  const isProd = process.env.NODE_ENV === 'production';
  res.status(error.statusCode || err.statusCode || 500).json({
    success: false,
    message: isProd && (!error.statusCode || error.statusCode === 500)
      ? 'Internal server error'
      : error.message || 'Server Error',
    ...(!isProd && { stack: err.stack }),
  });
};
