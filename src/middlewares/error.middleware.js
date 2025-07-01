const errorMiddleware = (err, req, res, next) => {
  // console.error("Error:", err); // Always log errors

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  const errors = err.errors || undefined;
  const success = false;

  return res.status(statusCode).json({
    statusCode,
    message,
    success,
    errors,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

export default errorMiddleware;
