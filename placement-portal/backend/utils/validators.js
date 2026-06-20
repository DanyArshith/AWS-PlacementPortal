// placeholder for shared validators; expand as needed
const { body } = require('express-validator');

exports.jobValidator = [
  body('companyId').isMongoId(),
  body('title').isString().notEmpty()
];
