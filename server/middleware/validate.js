const { validationResult } = require('express-validator');

/**
 * Runs after express-validator rules. Returns 400 with field errors if any.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = validate;
