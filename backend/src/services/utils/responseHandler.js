export const handleError = (res, error) => {
  console.error(error);
  const status = error.statusCode || 500;
  res.status(status).json({
    success: false,
    error: error.message || "Server error",
  });
};

export const handleSuccess = (res, data, statusCode = 200) => {
  res.status(statusCode).json({ success: true, data });
};
