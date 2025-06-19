const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { authenticate } = require('../middleware/auth');
const { taskValidationRules, processValidationErrors } = require('../middleware/validator');
const { catchAsync } = require('../middleware/errorHandler');

// All routes require authentication
router.use(authenticate);

// Task CRUD operations
router.post('/', 
  taskValidationRules.createTask, 
  processValidationErrors, 
  catchAsync(taskController.createTask)
);

router.get('/', 
  taskValidationRules.getTasks, 
  processValidationErrors, 
  catchAsync(taskController.getTasks)
);

router.get('/:id', 
  taskValidationRules.getTask, 
  processValidationErrors, 
  catchAsync(taskController.getTask)
);

router.put('/:id', 
  taskValidationRules.updateTask, 
  processValidationErrors, 
  catchAsync(taskController.updateTask)
);

router.delete('/:id', 
  taskValidationRules.deleteTask, 
  processValidationErrors, 
  catchAsync(taskController.deleteTask)
);

// Task-category relationship routes
router.post('/:taskId/categories/:categoryId', 
  catchAsync(taskController.addToCategory)
);

router.delete('/:taskId/categories/:categoryId', 
  catchAsync(taskController.removeFromCategory)
);

module.exports = router;