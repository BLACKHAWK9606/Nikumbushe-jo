const db = require('../config/db');
const bcrypt = require('bcrypt');

class UserModel {
  // Create a new user
  async create(userData) {
    const { first_name, last_name, username, password, email } = userData;
    
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const query = `
      INSERT INTO users (first_name, last_name, username, hashed_password, email)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING user_id, first_name, last_name, username, email, created_at
    `;
    
    const values = [first_name, last_name, username, hashedPassword, email];
    
    try {
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating user: ${error.message}`);
    }
  }
  
  // Find user by username
  async findByUsername(username) {
    const query = 'SELECT * FROM users WHERE username = $1';
    
    try {
      const result = await db.query(query, [username]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error finding user: ${error.message}`);
    }
  }
  
  // Find user by ID
  async findById(userId) {
    const query = 'SELECT user_id, first_name, last_name, username, email, created_at FROM users WHERE user_id = $1';
    
    try {
      const result = await db.query(query, [userId]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error finding user: ${error.message}`);
    }
  }
  
  // Find user by email
  async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    
    try {
      const result = await db.query(query, [email]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error finding user by email: ${error.message}`);
    }
  }
  
  // Store password reset token
  async storeResetToken(userId, resetToken, expiresAt) {
    const query = `
      UPDATE users 
      SET reset_token = $1, reset_token_expires = $2 
      WHERE user_id = $3
      RETURNING user_id
    `;
    
    try {
      const result = await db.query(query, [resetToken, expiresAt, userId]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error storing reset token: ${error.message}`);
    }
  }
  
  // Find user by reset token
  async findByResetToken(token) {
    const query = 'SELECT * FROM users WHERE reset_token = $1 AND reset_token_expires > NOW()';
    
    try {
      const result = await db.query(query, [token]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error finding user by reset token: ${error.message}`);
    }
  }
  
  // Reset password
  async resetPassword(userId, newPassword) {
    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    const query = `
      UPDATE users 
      SET hashed_password = $1, reset_token = NULL, reset_token_expires = NULL 
      WHERE user_id = $2
      RETURNING user_id
    `;
    
    try {
      const result = await db.query(query, [hashedPassword, userId]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error resetting password: ${error.message}`);
    }
  }
  
  // Update user
  async update(userId, userData) {
    const { first_name, last_name, email, bio } = userData;
    
    const query = `
      UPDATE users
      SET first_name = $1, last_name = $2, email = $3, bio = $4, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $5
      RETURNING user_id, first_name, last_name, username, email, bio, updated_at
    `;
    
    const values = [first_name, last_name, email, bio, userId];
    
    try {
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error updating user: ${error.message}`);
    }
  }
  
  // Change password
  async changePassword(userId, newPassword) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    const query = `
      UPDATE users
      SET hashed_password = $1, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $2
      RETURNING user_id
    `;
    
    try {
      const result = await db.query(query, [hashedPassword, userId]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error changing password: ${error.message}`);
    }
  }
  
  // Delete user
  async delete(userId) {
    const query = 'DELETE FROM users WHERE user_id = $1 RETURNING user_id';
    
    try {
      const result = await db.query(query, [userId]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error deleting user: ${error.message}`);
    }
  }
  
  // Verify password
  async verifyPassword(plainPassword, hashedPassword) {
    console.log('Plain password:', plainPassword);
    console.log('Hashed password:', hashedPassword);
    
    try {
      const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
      console.log('bcrypt comparison result:', isMatch);
      return isMatch;
    } catch (error) {
      console.error('Bcrypt comparison error:', error);
      return false;
    }
  }
}

module.exports = new UserModel();