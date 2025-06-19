const reminderModel = require('../models/reminderModel');
const taskModel = require('../models/taskModel');

class ReminderController {
  // Create a new reminder
  async createReminder(req, res) {
    try {
      const userId = req.user.userId;
      const { task_id, reminder_time } = req.body;
      
      // Check if required fields are provided
      if (!task_id || !reminder_time) {
        return res.status(400).json({
          success: false,
          message: 'Task ID and reminder time are required'
        });
      }
      
      // Check if task belongs to user
      const task = await taskModel.findById(task_id, userId);
      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Task not found'
        });
      }
      
      const reminder = await reminderModel.create({
        task_id,
        reminder_time
      });
      
      res.status(201).json({
        success: true,
        message: 'Reminder created successfully',
        reminder
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating reminder',
        error: error.message
      });
    }
  }
  
  // Get all reminders for a task
  async getTaskReminders(req, res) {
    try {
      const userId = req.user.userId;
      const taskId = req.params.taskId;
      
      // Check if task belongs to user
      const task = await taskModel.findById(taskId, userId);
      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Task not found'
        });
      }
      
      const reminders = await reminderModel.findByTaskId(taskId);
      
      res.status(200).json({
        success: true,
        count: reminders.length,
        task_name: task.task_name,
        reminders
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching reminders',
        error: error.message
      });
    }
  }
  
  // Update a reminder
  async updateReminder(req, res) {
    try {
      const userId = req.user.userId;
      const reminderId = req.params.id;
      const { reminder_time } = req.body;
      
      // Check if required fields are provided
      if (!reminder_time) {
        return res.status(400).json({
          success: false,
          message: 'Reminder time is required'
        });
      }
      
      // Get the reminder
      const existingReminder = await reminderModel.findById(reminderId);
      if (!existingReminder) {
        return res.status(404).json({
          success: false,
          message: 'Reminder not found'
        });
      }
      
      // Check if the associated task belongs to the user
      const task = await taskModel.findById(existingReminder.task_id, userId);
      if (!task) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this reminder'
        });
      }
      
      const updatedReminder = await reminderModel.update(reminderId, {
        reminder_time,
        is_sent: false // Reset the sent status since the time is changing
      });
      
      res.status(200).json({
        success: true,
        message: 'Reminder updated successfully',
        reminder: updatedReminder
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating reminder',
        error: error.message
      });
    }
  }
  
  // Delete a reminder
  async deleteReminder(req, res) {
    try {
      const userId = req.user.userId;
      const reminderId = req.params.id;
      
      // Get the reminder
      const reminder = await reminderModel.findById(reminderId);
      if (!reminder) {
        return res.status(404).json({
          success: false,
          message: 'Reminder not found'
        });
      }
      
      // Check if the associated task belongs to the user
      const task = await taskModel.findById(reminder.task_id, userId);
      if (!task) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to delete this reminder'
        });
      }
      
      const result = await reminderModel.delete(reminderId);
      
      res.status(200).json({
        success: true,
        message: 'Reminder deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting reminder',
        error: error.message
      });
    }
  }
  
  // Get all upcoming reminders for the user
  async getUpcomingReminders(req, res) {
    try {
      const userId = req.user.userId;
      const timeframe = req.query.timeframe || 24 * 60; // Default to 24 hours
      
      // Get upcoming reminders
      const allUpcomingReminders = await reminderModel.getUpcomingReminders(timeframe);
      
      // Filter to only include user's reminders
      const userReminders = allUpcomingReminders.filter(reminder => reminder.user_id === userId);
      
      res.status(200).json({
        success: true,
        count: userReminders.length,
        reminders: userReminders
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching upcoming reminders',
        error: error.message
      });
    }
  }
}

module.exports = new ReminderController();