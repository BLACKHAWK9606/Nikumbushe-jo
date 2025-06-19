const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticate } = require('../middleware/auth');
const { categoryValidationRules, processValidationErrors } = require('../middleware/validator');
const { catchAsync } = require('../middleware/errorHandler');

// All routes require authentication
router.use(authenticate);

// Category CRUD operations
router.post('/', 
  categoryValidationRules.createCategory, 
  processValidationErrors, 
  catchAsync(categoryController.createCategory)
);

router.get('/', 
  catchAsync(categoryController.getCategories)
);

router.get('/:id', 
  categoryValidationRules.getCategory, 
  processValidationErrors, 
  catchAsync(categoryController.getCategory)
);

router.put('/:id', 
  categoryValidationRules.updateCategory, 
  processValidationErrors, 
  catchAsync(categoryController.updateCategory)
);

router.delete('/:id', 
  categoryValidationRules.deleteCategory, 
  processValidationErrors, 
  catchAsync(categoryController.deleteCategory)
);

// Get tasks in a specific category
router.get('/:id/tasks', 
  categoryValidationRules.getCategory, 
  processValidationErrors, 
  catchAsync(categoryController.getCategoryTasks)
);

module.exports = router;