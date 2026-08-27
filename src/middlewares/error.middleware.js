const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  return res.status(statusCode).json({
    statusCode,
    message: err.message || "Something went wrong",
    data: err.data || null,
    success: err.success || false,
    errors: err.errors || []
  });
};

export { errorHandler };