const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const { userValidationRules, processValidationErrors } = require('../middleware/validator');
const { catchAsync } = require('../middleware/errorHandler');

// Public routes
router.post('/register', 
  userValidationRules.register, 
  processValidationErrors, 
  catchAsync(userController.register)
);

router.post('/login', 
  userValidationRules.login, 
  processValidationErrors, 
  catchAsync(userController.login)
);

// Password reset routes
router.post('/forgot-password',
  userValidationRules.forgotPassword,
  processValidationErrors,
  catchAsync(userController.forgotPassword)
);

router.post('/reset-password/:token',
  userValidationRules.resetPassword,
  processValidationErrors,
  catchAsync(userController.resetPassword)
);

// Protected routes - require authentication
router.get('/profile', 
  authenticate, 
  catchAsync(userController.getProfile)
);

router.put('/profile', 
  authenticate, 
  userValidationRules.updateProfile, 
  processValidationErrors, 
  catchAsync(userController.updateProfile)
);

// Profile picture routes
router.post('/profile/picture', 
  authenticate, 
  catchAsync(userController.uploadProfilePicture)
);

router.get('/profile/picture', 
  authenticate, 
  catchAsync(userController.getProfilePicture)
);

// Get profile picture by user ID (can be public)
router.get('/profile/picture/:id', 
  catchAsync(userController.getProfilePicture)
);

router.put('/change-password', 
  authenticate, 
  userValidationRules.changePassword, 
  processValidationErrors, 
  catchAsync(userController.changePassword)
);

router.delete('/account', 
  authenticate, 
  catchAsync(userController.deleteAccount)
);

module.exports = router;