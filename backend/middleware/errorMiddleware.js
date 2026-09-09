const errorMiddleware = (err, req, res, next) => {
  console.error('❌ Unhandled error:', err.message);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong.' : message,
  });
};

module.exports = errorMiddleware;
