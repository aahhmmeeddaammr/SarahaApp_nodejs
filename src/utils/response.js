export const asyncHandler = (fn) => {
  return async (req, res, next) => {
    return await fn(req, res, next).catch((err) => {
      err.cause = 500;
      next(err);
    });
  };
};

export const globalErrorHandelar = (error, req, res, next) => {
  return res.status(error.cause || 400).json({ message: error.message, stack: error.stack });
};
