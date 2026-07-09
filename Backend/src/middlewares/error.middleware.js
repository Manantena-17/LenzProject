
module.exports = (err, req, res, next) => {

  const statusCode = err.statusCode || 500;
  
  console.error(`[Error] ${statusCode} - ${err.message}`);

  res.status(statusCode).json({
    success: false,
    message: err.message || "Une erreur interne est survenue",
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};