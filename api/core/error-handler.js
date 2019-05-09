const logger = require('./logger');
module.exports = errorHandler;

function errorHandler(err, req, res, next) {
  if (typeof err === 'string') {
    // custom application error
    return res.status(400).json({ message: err });
  }

  if (err.name === 'ValidationError') {
    // mongoose validation error
    return res.status(400).json({ message: err.message });
  }

  if (err.name === 'UnauthorizedError') {
    // jwt authentication error
    return res.status(401).json({ message: 'Invalid Token' });
  }

  if (err.name === 'ParameterError') {
    return res.status(400).json({ message: err.message });
  }

  // default to 500 server error
  logger.error(err.message);
  if (process.env.NODE_ENV === 'development') return res.status(500).json({ message: err.message });
  else return res.status(500).json({ message: 'Something went wrong.' });
}
