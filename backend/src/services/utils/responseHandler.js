export const handleError = (res, error) => {
  // Default values
  const defaultMessage = "Something went wrong";
  const defaultStatus = 400;

  // Customizable properties (if error provides them)
  const message = error.message || defaultMessage;
  const status = error.status || error.statusCode || defaultStatus;

  console.error(`[Error ${status}]:`, message, error.stack || "");

  res.status(status).json({
    success: false,
    error: message,
  });
};


export const response = (res, success, message, statusCode) => {
  return res.status(statusCode).json({
    success,
    message,
  });
};
// return response(res, true, "Group deleted successfully", 200);
