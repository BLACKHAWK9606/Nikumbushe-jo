const { body, param, query, validationResult } = require('express-validator');

// Process validation errors
const processValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  next();
};

// User validation rules
const userValidationRules = {
  // Password reset validation rules
  forgotPassword: [
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Invalid email format')
      .normalizeEmail()
  ],
  
  resetPassword: [
    body('password')
      .trim()
      .notEmpty().withMessage('New password is required')
      .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    
    body('confirmPassword')
      .trim()
      .notEmpty().withMessage('Confirm password is required')
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Passwords do not match');
        }
        return true;
      })
  ],
  
  register: [
    body('first_name')
      .trim()
      .notEmpty().withMessage('First name is required')
      .isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters'),
    
    body('last_name')
      .trim()
      .notEmpty().withMessage('Last name is required')
      .isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters'),
    
    body('username')
      .trim()
      .notEmpty().withMessage('Username is required')
      .isLength({ min: 3, max: 50 }).withMessage('Username must be between 3 and 50 characters')
      .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, and underscores'),
    
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Invalid email format')
      .normalizeEmail(),
    
    body('password')
      .trim()
      .notEmpty().withMessage('Password is required')
      .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
  ],
  
  login: [
    body('username')
      .trim()
      .notEmpty().withMessage('Username is required'),
    
    body('password')
      .trim()
      .notEmpty().withMessage('Password is required')
  ],
  
  updateProfile: [
    body('first_name')
      .trim()
      .notEmpty().withMessage('First name is required')
      .isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters'),
    
    body('last_name')
      .trim()
      .notEmpty().withMessage('Last name is required')
      .isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters'),
    
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Invalid email format')
      .normalizeEmail()
  ],
  
  changePassword: [
    body('current_password')
      .trim()
      .notEmpty().withMessage('Current password is required'),
    
    body('new_password')
      .trim()
      .notEmpty().withMessage('New password is required')
      .isLength({ min: 6 }).withMessage('New password must be at least 6 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
  ]
};

// Task validation rules
const taskValidationRules = {
  createTask: [
    body('task_name')
      .trim()
      .notEmpty().withMessage('Task name is required')
      .isLength({ min: 1, max: 100 }).withMessage('Task name must be between 1 and 100 characters'),
    
    body('due_date')
      .optional()
      .isISO8601().withMessage('Due date must be a valid ISO date format'),
    
    body('status')
      .optional()
      .isIn(['pending', 'in_progress', 'completed']).withMessage('Status must be one of: pending, in_progress, completed'),
    
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high']).withMessage('Priority must be one of: low, medium, high'),
    
    body('category_ids')
      .optional()
      .isArray().withMessage('Category IDs must be an array'),
    
    body('category_ids.*')
      .optional()
      .isInt().withMessage('Each category ID must be an integer'),
    
    body('reminder_time')
      .optional()
      .isISO8601().withMessage('Reminder time must be a valid ISO date format')
  ],
  
  updateTask: [
    param('id')
      .isInt().withMessage('Task ID must be an integer'),
    
    body('task_name')
      .trim()
      .notEmpty().withMessage('Task name is required')
      .isLength({ min: 1, max: 100 }).withMessage('Task name must be between 1 and 100 characters'),
    
    body('due_date')
      .optional()
      .isISO8601().withMessage('Due date must be a valid ISO date format'),
    
    body('status')
      .optional()
      .isIn(['pending', 'in_progress', 'completed']).withMessage('Status must be one of: pending, in_progress, completed'),
    
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high']).withMessage('Priority must be one of: low, medium, high'),
    
    body('category_ids')
      .optional()
      .isArray().withMessage('Category IDs must be an array'),
    
    body('category_ids.*')
      .optional()
      .isInt().withMessage('Each category ID must be an integer')
  ],
  
  getTask: [
    param('id')
      .isInt().withMessage('Task ID must be an integer')
  ],
  
  deleteTask: [
    param('id')
      .isInt().withMessage('Task ID must be an integer')
  ],
  
  getTasks: [
    query('status')
      .optional()
      .isIn(['pending', 'in_progress', 'completed']).withMessage('Status must be one of: pending, in_progress, completed'),
    
    query('due_date')
      .optional()
      .isISO8601().withMessage('Due date must be a valid ISO date format'),
    
    query('sort_by')
      .optional()
      .isIn(['task_name', 'due_date', 'status', 'priority', 'created_at']).withMessage('Sort by must be one of: task_name, due_date, status, priority, created_at'),
    
    query('sort_dir')
      .optional()
      .isIn(['ASC', 'DESC', 'asc', 'desc']).withMessage('Sort direction must be either ASC or DESC')
  ]
};

// Category validation rules
const categoryValidationRules = {
  createCategory: [
    body('category_name')
      .trim()
      .notEmpty().withMessage('Category name is required')
      .isLength({ min: 1, max: 50 }).withMessage('Category name must be between 1 and 50 characters')
  ],
  
  updateCategory: [
    param('id')
      .isInt().withMessage('Category ID must be an integer'),
    
    body('category_name')
      .trim()
      .notEmpty().withMessage('Category name is required')
      .isLength({ min: 1, max: 50 }).withMessage('Category name must be between 1 and 50 characters')
  ],
  
  getCategory: [
    param('id')
      .isInt().withMessage('Category ID must be an integer')
  ],
  
  deleteCategory: [
    param('id')
      .isInt().withMessage('Category ID must be an integer')
  ]
};

// Reminder validation rules
const reminderValidationRules = {
  createReminder: [
    body('task_id')
      .isInt().withMessage('Task ID must be an integer'),
    
    body('reminder_time')
      .notEmpty().withMessage('Reminder time is required')
      .isISO8601().withMessage('Reminder time must be a valid ISO date format')
  ],
  
  updateReminder: [
    param('id')
      .isInt().withMessage('Reminder ID must be an integer'),
    
    body('reminder_time')
      .notEmpty().withMessage('Reminder time is required')
      .isISO8601().withMessage('Reminder time must be a valid ISO date format')
  ],
  
  deleteReminder: [
    param('id')
      .isInt().withMessage('Reminder ID must be an integer')
  ],
  
  getTaskReminders: [
    param('taskId')
      .isInt().withMessage('Task ID must be an integer')
  ],
  
  getUpcomingReminders: [
    query('timeframe')
      .optional()
      .isInt({ min: 1 }).withMessage('Timeframe must be a positive integer representing minutes')
  ]
};

module.exports = {
  processValidationErrors,
  userValidationRules,
  taskValidationRules,
  categoryValidationRules,
  reminderValidationRules
};