const taskModel = require('../models/taskModel');
const reminderModel = require('../models/reminderModel');

class TaskController {
  // Create a new task
  async createTask(req, res) {
    try {
      const userId = req.user.userId;
      const { task_name, description, due_date, status, priority, reminder_time, category_ids } = req.body;
      
      // Check if required fields are provided
      if (!task_name) {
        return res.status(400).json({
          success: false,
          message: 'Task name is required'
        });
      }
      
      // Create the task
      const task = await taskModel.create({
        task_name,
        description,
        due_date,
        status,
        priority,
        user_id: userId
      });
      
      // Add task to categories if provided
      if (category_ids && Array.isArray(category_ids) && category_ids.length > 0) {
        for (const categoryId of category_ids) {
          await taskModel.addToCategory(task.task_id, categoryId);
        }
      }
      
      // Create reminder if provided
      let reminder = null;
      if (reminder_time) {
        reminder = await reminderModel.create({
          task_id: task.task_id,
          reminder_time
        });
      }
      
      res.status(201).json({
        success: true,
        message: 'Task created successfully',
        task,
        reminder,
        categories: category_ids || []
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating task',
        error: error.message
      });
    }
  }
  
  // Get all tasks for a user
  async getTasks(req, res) {
    try {
      const userId = req.user.userId;
      const { status, due_date, sort_by, sort_dir } = req.query;
      
      // Apply filters
      const filters = {
        status,
        due_date,
        sort_by,
        sort_dir
      };
      
      const tasks = await taskModel.findByUserId(userId, filters);
      
      // Format response
      const formattedTasks = await Promise.all(
        tasks.map(async (task) => {
          const categories = await taskModel.getCategories(task.task_id);
          const reminders = await reminderModel.findByTaskId(task.task_id);
          
          return {
            ...task,
            categories,
            reminders
          };
        })
      );
      
      res.status(200).json({
        success: true,
        count: formattedTasks.length,
        tasks: formattedTasks
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching tasks',
        error: error.message
      });
    }
  }
  
  // Get a specific task
  async getTask(req, res) {
    try {
      const userId = req.user.userId;
      const taskId = req.params.id;
      
      const task = await taskModel.findById(taskId, userId);
      
      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Task not found'
        });
      }
      
      // Get categories and reminders
      const categories = await taskModel.getCategories(taskId);
      const reminders = await reminderModel.findByTaskId(taskId);
      
      res.status(200).json({
        success: true,
        task: {
          ...task,
          categories,
          reminders
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching task',
        error: error.message
      });
    }
  }
  
  // Update a task
  async updateTask(req, res) {
    try {
      const userId = req.user.userId;
      const taskId = req.params.id;
      const { task_name, description, due_date, status, priority, category_ids } = req.body;
      
      // Check if required fields are provided
      if (!task_name) {
        return res.status(400).json({
          success: false,
          message: 'Task name is required'
        });
      }
      
      // Check if task exists
      const existingTask = await taskModel.findById(taskId, userId);
      if (!existingTask) {
        return res.status(404).json({
          success: false,
          message: 'Task not found'
        });
      }
      
      // Update the task
      const updatedTask = await taskModel.update(taskId, userId, {
        task_name,
        description,
        due_date,
        status,
        priority
      });
      
      // Update categories if provided
      if (category_ids && Array.isArray(category_ids)) {
        // Get current categories
        const currentCategories = await taskModel.getCategories(taskId);
        const currentCategoryIds = currentCategories.map(cat => cat.category_id);
        
        // Remove task from categories that are no longer associated
        for (const catId of currentCategoryIds) {
          if (!category_ids.includes(catId)) {
            await taskModel.removeFromCategory(taskId, catId);
          }
        }
        
        // Add task to new categories
        for (const catId of category_ids) {
          if (!currentCategoryIds.includes(catId)) {
            await taskModel.addToCategory(taskId, catId);
          }
        }
      }
      
      // Get updated categories
      const categories = await taskModel.getCategories(taskId);
      
      res.status(200).json({
        success: true,
        message: 'Task updated successfully',
        task: {
          ...updatedTask,
          categories
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating task',
        error: error.message
      });
    }
  }
  
  // Delete a task
  async deleteTask(req, res) {
    try {
      const userId = req.user.userId;
      const taskId = req.params.id;
      
      const result = await taskModel.delete(taskId, userId);
      
      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'Task not found'
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Task deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting task',
        error: error.message
      });
    }
  }
  
  // Add task to category
  async addToCategory(req, res) {
    try {
      const userId = req.user.userId;
      const { taskId, categoryId } = req.params;
      
      // Check if task belongs to user
      const task = await taskModel.findById(taskId, userId);
      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Task not found'
        });
      }
      
      const result = await taskModel.addToCategory(taskId, categoryId);
      
      res.status(200).json({
        success: true,
        message: 'Task added to category successfully',
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error adding task to category',
        error: error.message
      });
    }
  }
  
  // Remove task from category
  async removeFromCategory(req, res) {
    try {
      const userId = req.user.userId;
      const { taskId, categoryId } = req.params;
      
      // Check if task belongs to user
      const task = await taskModel.findById(taskId, userId);
      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Task not found'
        });
      }
      
      const result = await taskModel.removeFromCategory(taskId, categoryId);
      
      res.status(200).json({
        success: true,
        message: 'Task removed from category successfully',
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error removing task from category',
        error: error.message
      });
    }
  }
}

module.exports = new TaskController();