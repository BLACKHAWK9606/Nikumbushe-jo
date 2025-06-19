const categoryModel = require('../models/categoryModel');

class CategoryController {
  // Create a new category
  async createCategory(req, res) {
    try {
      const userId = req.user.userId;
      const { category_name } = req.body;
      
      // Check if required fields are provided
      if (!category_name) {
        return res.status(400).json({
          success: false,
          message: 'Category name is required'
        });
      }
      
      const category = await categoryModel.create({
        category_name,
        user_id: userId
      });
      
      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        category
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating category',
        error: error.message
      });
    }
  }
  
  // Get all categories for a user
  async getCategories(req, res) {
    try {
      const userId = req.user.userId;
      
      const categories = await categoryModel.findByUserId(userId);
      
      res.status(200).json({
        success: true,
        count: categories.length,
        categories
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching categories',
        error: error.message
      });
    }
  }
  
  // Get a specific category
  async getCategory(req, res) {
    try {
      const userId = req.user.userId;
      const categoryId = req.params.id;
      
      const category = await categoryModel.findById(categoryId, userId);
      
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }
      
      // Get tasks in this category
      const tasks = await categoryModel.getTasks(categoryId, userId);
      
      res.status(200).json({
        success: true,
        category: {
          ...category,
          tasks
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching category',
        error: error.message
      });
    }
  }
  
  // Update a category
  async updateCategory(req, res) {
    try {
      const userId = req.user.userId;
      const categoryId = req.params.id;
      const { category_name } = req.body;
      
      // Check if required fields are provided
      if (!category_name) {
        return res.status(400).json({
          success: false,
          message: 'Category name is required'
        });
      }
      
      const category = await categoryModel.update(categoryId, userId, {
        category_name
      });
      
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Category updated successfully',
        category
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating category',
        error: error.message
      });
    }
  }
  
  // Delete a category
  async deleteCategory(req, res) {
    try {
      const userId = req.user.userId;
      const categoryId = req.params.id;
      
      const result = await categoryModel.delete(categoryId, userId);
      
      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Category deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting category',
        error: error.message
      });
    }
  }
  
  // Get all tasks in a category
  async getCategoryTasks(req, res) {
    try {
      const userId = req.user.userId;
      const categoryId = req.params.id;
      
      // Check if category exists and belongs to user
      const category = await categoryModel.findById(categoryId, userId);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }
      
      const tasks = await categoryModel.getTasks(categoryId, userId);
      
      res.status(200).json({
        success: true,
        count: tasks.length,
        category_name: category.category_name,
        tasks
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching category tasks',
        error: error.message
      });
    }
  }
}

module.exports = new CategoryController();