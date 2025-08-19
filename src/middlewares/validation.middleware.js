export const validation = (schema) => {
  return (req, res, next) => {
    const errors = [];
    Object.keys(schema).forEach((key) => {
      const result = schema[key].validate(req[key]);
      if (result.error) {
        errors.push(
          ...result.error.details.map((error) => {
            return { path: error.path[0], message: error.message };
          })
        );
      }
    });
    if (errors.length) {
      return res.status(400).json({ message: "validation error", errors });
    }
    next();
  };
};
