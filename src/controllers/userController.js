const userModel = require('../models/userModel');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
require('dotenv').config();

// JWT secret from environment variables
// CHANGE: Remove the fallback and always use the environment variable
const JWT_SECRET = process.env.JWT_SECRET;

class UserController {
  // Register a new user
  async register(req, res) {
    try {
      const { first_name, last_name, username, password, email } = req.body;
      
      // Check if required fields are provided
      if (!first_name || !last_name || !username || !password || !email) {
        return res.status(400).json({ 
          success: false, 
          message: 'All fields are required' 
        });
      }
      
      // Check if user already exists
      const existingUser = await userModel.findByUsername(username);
      if (existingUser) {
        return res.status(409).json({ 
          success: false, 
          message: 'Username already exists' 
        });
      }
      
      // Create new user
      const user = await userModel.create({
        first_name,
        last_name,
        username,
        password,
        email
      });
      
      // Generate JWT token
      const token = jwt.sign(
        { userId: user.user_id, username: user.username },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        token,
        user: {
          id: user.user_id,
          username: user.username,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error registering user',
        error: error.message
      });
    }
  }
  
  // Login user
  async login(req, res) {
    try {
      console.log("Login attempt received:", req.body);
      
      const { username, password } = req.body;
      
      // Check if username and password are provided
      if (!username || !password) {
        console.log("Missing credentials");
        return res.status(400).json({
          success: false,
          message: 'Username and password are required'
        });
      }
      
      // Find user by username
      const user = await userModel.findByUsername(username);
      console.log("User lookup result:", user ? "User found" : "User not found");
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid username or password'
        });
      }
      
      // Verify password
      const isPasswordValid = await userModel.verifyPassword(
        password,
        user.hashed_password
      );
      
      console.log("Password validation result:", isPasswordValid);
      console.log("Provided password:", password);
      console.log("Stored hash:", user.hashed_password);
      
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid username or password'
        });
      }
      
      // Generate JWT token
      const token = jwt.sign(
        { userId: user.user_id, username: user.username },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      console.log("Login successful for user:", username);
      
      res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user.user_id,
          username: user.username,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          profile_picture: user.profile_picture ? true : false,
          bio: user.bio
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Error logging in',
        error: error.message
      });
    }
  }
  
  // Get user profile
  async getProfile(req, res) {
    try {
      const userId = req.user.userId;
      
      const user = await userModel.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      res.status(200).json({
        success: true,
        user: {
          id: user.user_id,
          username: user.username,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          bio: user.bio || '',
          profile_picture: user.profile_picture ? true : false,
          created_at: user.created_at
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching user profile',
        error: error.message
      });
    }
  }
  
  // Update user profile
  async updateProfile(req, res) {
    try {
      const userId = req.user.userId;
      const { first_name, last_name, email, bio } = req.body;
      
      // Check if required fields are provided
      if (!first_name || !last_name || !email) {
        return res.status(400).json({
          success: false,
          message: 'First name, last name, and email are required'
        });
      }
      
      const updatedUser = await userModel.update(userId, {
        first_name,
        last_name,
        email,
        bio
      });
      
      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        user: {
          id: updatedUser.user_id,
          username: updatedUser.username,
          first_name: updatedUser.first_name,
          last_name: updatedUser.last_name,
          email: updatedUser.email,
          bio: updatedUser.bio || '',
          profile_picture: updatedUser.profile_picture ? true : false,
          updated_at: updatedUser.updated_at
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating profile',
        error: error.message
      });
    }
  }
  
  // Upload profile picture
  async uploadProfilePicture(req, res) {
    try {
      const userId = req.user.userId;
      const { profile_picture } = req.body;
      
      if (!profile_picture) {
        return res.status(400).json({
          success: false,
          message: 'Profile picture is required'
        });
      }
      
      // Save profile picture
      const updatedUser = await userModel.updateProfilePicture(userId, profile_picture);
      
      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Profile picture updated successfully',
        profile_picture: true,
        updated_at: updatedUser.updated_at
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error uploading profile picture',
        error: error.message
      });
    }
  }
  
  // Get profile picture
  async getProfilePicture(req, res) {
    try {
      const userId = req.params.id || req.user.userId;
      
      const user = await userModel.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      if (!user.profile_picture) {
        return res.status(404).json({
          success: false,
          message: 'No profile picture found'
        });
      }
      
      // Set appropriate content type for image
      res.setHeader('Content-Type', 'image/jpeg');
      res.send(user.profile_picture);
      
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching profile picture',
        error: error.message
      });
    }
  }
  
  // Forgot password - request password reset
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      
      // Find user by email
      const user = await userModel.findByEmail(email);
      
      if (!user) {
        // For security reasons, don't reveal that the email doesn't exist
        return res.status(200).json({
          success: true,
          message: 'If your email is registered, you will receive a password reset link'
        });
      }
      
      // Generate a random token
      const resetToken = crypto.randomBytes(32).toString('hex');
      
      // Set token expiration (1 hour from now)
      const expiresAt = new Date(Date.now() + 3600000);
      
      // Store the token in the database
      await userModel.storeResetToken(user.user_id, resetToken, expiresAt);
      
      // In a real application, you would send an email with the reset link
      // For this implementation, we'll just return the token in the response
      
      res.status(200).json({
        success: true,
        message: 'Password reset link has been sent to your email',
        // In a real app, you would NOT include this in the response
        // This is just for demonstration purposes
        resetToken,
        resetLink: `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error processing password reset request',
        error: error.message
      });
    }
  }
  
  // Reset password using token
  async resetPassword(req, res) {
    try {
      const { token } = req.params;
      const { password } = req.body;
      
      // Find user by reset token (token must not be expired)
      const user = await userModel.findByResetToken(token);
      
      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired password reset token'
        });
      }
      
      // Reset the password
      await userModel.resetPassword(user.user_id, password);
      
      res.status(200).json({
        success: true,
        message: 'Password has been reset successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error resetting password',
        error: error.message
      });
    }
  }
  
  // Change password
  async changePassword(req, res) {
    try {
      const userId = req.user.userId;
      const { current_password, new_password } = req.body;
      
      // Check if required fields are provided
      if (!current_password || !new_password) {
        return res.status(400).json({
          success: false,
          message: 'Current password and new password are required'
        });
      }
      
      // Get user to verify current password
      const user = await userModel.findByUsername(req.user.username);
      
      // Verify current password
      const isPasswordValid = await userModel.verifyPassword(
        current_password,
        user.hashed_password
      );
      
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }
      
      // Update password
      await userModel.changePassword(userId, new_password);
      
      res.status(200).json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error changing password',
        error: error.message
      });
    }
  }
  
  // Delete user account
  async deleteAccount(req, res) {
    try {
      const userId = req.user.userId;
      
      const result = await userModel.delete(userId);
      
      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Account deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting account',
        error: error.message
      });
    }
  }
}

module.exports = new UserController();