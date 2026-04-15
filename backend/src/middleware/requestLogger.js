const requestLogger = (req, res, next) => {
  const startedAt = Date.now();

  res.on("finish", () => {
    console.log(
      `[REQUEST] ${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - startedAt}ms`
    );
  });

  next();
};

module.exports = {
  requestLogger,
};
