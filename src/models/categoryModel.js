const db = require('../config/db');

class CategoryModel {
  // Create a new category
  async create(categoryData) {
    const { category_name, user_id } = categoryData;
    
    const query = `
      INSERT INTO categories (category_name, user_id)
      VALUES ($1, $2)
      RETURNING *
    `;
    
    try {
      const result = await db.query(query, [category_name, user_id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating category: ${error.message}`);
    }
  }
  
  // Get all categories for a user
  async findByUserId(userId) {
    const query = 'SELECT * FROM categories WHERE user_id = $1 ORDER BY category_name';
    
    try {
      const result = await db.query(query, [userId]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error finding categories: ${error.message}`);
    }
  }
  
  // Get category by ID
  async findById(categoryId, userId) {
    const query = 'SELECT * FROM categories WHERE category_id = $1 AND user_id = $2';
    
    try {
      const result = await db.query(query, [categoryId, userId]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error finding category: ${error.message}`);
    }
  }
  
  // Update category
  async update(categoryId, userId, categoryData) {
    const { category_name } = categoryData;
    
    const query = `
      UPDATE categories
      SET category_name = $1, updated_at = CURRENT_TIMESTAMP
      WHERE category_id = $2 AND user_id = $3
      RETURNING *
    `;
    
    try {
      const result = await db.query(query, [category_name, categoryId, userId]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error updating category: ${error.message}`);
    }
  }
  
  // Delete category
  async delete(categoryId, userId) {
    const query = 'DELETE FROM categories WHERE category_id = $1 AND user_id = $2 RETURNING category_id';
    
    try {
      const result = await db.query(query, [categoryId, userId]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error deleting category: ${error.message}`);
    }
  }
  
  // Get all tasks for a category
  async getTasks(categoryId, userId) {
    const query = `
      SELECT t.*
      FROM tasks t
      JOIN tasks_categories tc ON t.task_id = tc.task_id
      WHERE tc.category_id = $1 AND t.user_id = $2
      ORDER BY t.due_date ASC
    `;
    
    try {
      const result = await db.query(query, [categoryId, userId]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error getting category tasks: ${error.message}`);
    }
  }
}

module.exports = new CategoryModel();