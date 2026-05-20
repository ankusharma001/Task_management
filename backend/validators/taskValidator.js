const { body, validationResult } = require('express-validator');

const validateTask = [
  body('title')
    .notEmpty()
    .withMessage('Task title is required')
    .trim()
    .isLength({ max: 150 })
    .withMessage('Title cannot exceed 150 characters'),
  body('description')
    .notEmpty()
    .withMessage('Task description is required')
    .trim(),
  body('projectId')
    .notEmpty()
    .withMessage('Project ID is required')
    .isMongoId()
    .withMessage('Invalid Project ID format'),
  body('assignedTo')
    .notEmpty()
    .withMessage('Assigned User ID is required')
    .isMongoId()
    .withMessage('Invalid User ID format'),
  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High', 'Urgent'])
    .withMessage('Priority must be one of: Low, Medium, High, Urgent'),
  body('status')
    .optional()
    .isIn(['Todo', 'In Progress', 'Completed', 'Blocked'])
    .withMessage('Status must be one of: Todo, In Progress, Completed, Blocked'),
  body('dueDate')
    .notEmpty()
    .withMessage('Due date is required')
    .isISO8601()
    .withMessage('Due date must be a valid date format'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array().map(err => ({ field: err.path, message: err.msg }))
      });
    }
    next();
  }
];

module.exports = {
  validateTask
};
