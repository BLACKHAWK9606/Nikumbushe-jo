const db = require('../config/db');

class TaskModel {
  // Create a new task
  async create(taskData) {
    const { task_name, description, due_date, status, priority, user_id } = taskData;
    
    const query = `
      INSERT INTO tasks (task_name, description, due_date, status, priority, user_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const values = [
      task_name, 
      description, 
      due_date, 
      status || 'pending', 
      priority || 'medium', 
      user_id
    ];
    
    try {
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating task: ${error.message}`);
    }
  }
  
  // Get all tasks for a user
  async findByUserId(userId, filters = {}) {
    let query = 'SELECT * FROM tasks WHERE user_id = $1';
    const queryParams = [userId];
    
    // Add filter for status if provided
    if (filters.status) {
      query += ' AND status = $' + (queryParams.length + 1);
      queryParams.push(filters.status);
    }
    
    // Add filter for due date if provided
    if (filters.due_date) {
      query += ' AND due_date::date = $' + (queryParams.length + 1) + '::date';
      queryParams.push(filters.due_date);
    }
    
    // Sort by due date or created date
    query += ' ORDER BY ' + (filters.sort_by || 'created_at') + ' ' + (filters.sort_dir || 'ASC');
    
    try {
      const result = await db.query(query, queryParams);
      return result.rows;
    } catch (error) {
      throw new Error(`Error finding tasks: ${error.message}`);
    }
  }
  
  // Get task by ID
  async findById(taskId, userId) {
    const query = 'SELECT * FROM tasks WHERE task_id = $1 AND user_id = $2';
    
    try {
      const result = await db.query(query, [taskId, userId]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error finding task: ${error.message}`);
    }
  }
  
  // Update task
  async update(taskId, userId, taskData) {
    const { task_name, description, due_date, status, priority } = taskData;
    
    const query = `
      UPDATE tasks
      SET task_name = $1, description = $2, due_date = $3, status = $4, priority = $5, updated_at = CURRENT_TIMESTAMP
      WHERE task_id = $6 AND user_id = $7
      RETURNING *
    `;
    
    const values = [
      task_name,
      description,
      due_date,
      status,
      priority,
      taskId,
      userId
    ];
    
    try {
      const result = await db.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error updating task: ${error.message}`);
    }
  }
  
  // Delete task
  async delete(taskId, userId) {
    const query = 'DELETE FROM tasks WHERE task_id = $1 AND user_id = $2 RETURNING task_id';
    
    try {
      const result = await db.query(query, [taskId, userId]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error deleting task: ${error.message}`);
    }
  }
  
  // Add task to category
  async addToCategory(taskId, categoryId) {
    const query = `
      INSERT INTO tasks_categories (task_id, category_id)
      VALUES ($1, $2)
      RETURNING *
    `;
    
    try {
      const result = await db.query(query, [taskId, categoryId]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error adding task to category: ${error.message}`);
    }
  }
  
  // Remove task from category
  async removeFromCategory(taskId, categoryId) {
    const query = 'DELETE FROM tasks_categories WHERE task_id = $1 AND category_id = $2 RETURNING *';
    
    try {
      const result = await db.query(query, [taskId, categoryId]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error removing task from category: ${error.message}`);
    }
  }
  
  // Get all categories for a task
  async getCategories(taskId) {
    const query = `
      SELECT c.category_id, c.category_name
      FROM categories c
      JOIN tasks_categories tc ON c.category_id = tc.category_id
      WHERE tc.task_id = $1
    `;
    
    try {
      const result = await db.query(query, [taskId]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error getting task categories: ${error.message}`);
    }
  }
}

module.exports = new TaskModel();