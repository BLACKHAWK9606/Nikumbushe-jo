const express = require('express');
const router = express.Router();
const reminderController = require('../controllers/reminderController');
const { authenticate } = require('../middleware/auth');
const { reminderValidationRules, processValidationErrors } = require('../middleware/validator');
const { catchAsync } = require('../middleware/errorHandler');

// All routes require authentication
router.use(authenticate);

// Reminder operations
router.post('/', 
  reminderValidationRules.createReminder, 
  processValidationErrors, 
  catchAsync(reminderController.createReminder)
);

router.get('/upcoming', 
  reminderValidationRules.getUpcomingReminders, 
  processValidationErrors, 
  catchAsync(reminderController.getUpcomingReminders)
);

router.get('/task/:taskId', 
  reminderValidationRules.getTaskReminders, 
  processValidationErrors, 
  catchAsync(reminderController.getTaskReminders)
);

router.put('/:id', 
  reminderValidationRules.updateReminder, 
  processValidationErrors, 
  catchAsync(reminderController.updateReminder)
);

router.delete('/:id', 
  reminderValidationRules.deleteReminder, 
  processValidationErrors, 
  catchAsync(reminderController.deleteReminder)
);

module.exports = router;