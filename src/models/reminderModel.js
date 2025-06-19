const db = require('../config/db');

class ReminderModel {
  // Create a new reminder
  async create(reminderData) {
    const { task_id, reminder_time } = reminderData;
    
    const query = `
      INSERT INTO reminders (task_id, reminder_time)
      VALUES ($1, $2)
      RETURNING *
    `;
    
    try {
      const result = await db.query(query, [task_id, reminder_time]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating reminder: ${error.message}`);
    }
  }
  
  // Get all reminders for a task
  async findByTaskId(taskId) {
    const query = 'SELECT * FROM reminders WHERE task_id = $1 ORDER BY reminder_time';
    
    try {
      const result = await db.query(query, [taskId]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error finding reminders: ${error.message}`);
    }
  }
  
  // Get reminder by ID
  async findById(reminderId) {
    const query = 'SELECT * FROM reminders WHERE reminder_id = $1';
    
    try {
      const result = await db.query(query, [reminderId]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error finding reminder: ${error.message}`);
    }
  }
  
  // Update reminder
  async update(reminderId, reminderData) {
    const { reminder_time, is_sent } = reminderData;
    
    const query = `
      UPDATE reminders
      SET reminder_time = $1, is_sent = $2
      WHERE reminder_id = $3
      RETURNING *
    `;
    
    try {
      const result = await db.query(query, [reminder_time, is_sent, reminderId]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error updating reminder: ${error.message}`);
    }
  }
  
  // Delete reminder
  async delete(reminderId) {
    const query = 'DELETE FROM reminders WHERE reminder_id = $1 RETURNING reminder_id';
    
    try {
      const result = await db.query(query, [reminderId]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error deleting reminder: ${error.message}`);
    }
  }
  
  // Get all upcoming reminders
  async getUpcomingReminders(minutes = 15) {
    const query = `
      SELECT r.*, t.task_name, t.user_id
      FROM reminders r
      JOIN tasks t ON r.task_id = t.task_id
      WHERE r.is_sent = false
      AND r.reminder_time BETWEEN NOW() AND NOW() + INTERVAL '${minutes} minutes'
    `;
    
    try {
      const result = await db.query(query);
      return result.rows;
    } catch (error) {
      throw new Error(`Error getting upcoming reminders: ${error.message}`);
    }
  }
  
  // Mark reminder as sent
  async markAsSent(reminderId) {
    const query = `
      UPDATE reminders
      SET is_sent = true
      WHERE reminder_id = $1
      RETURNING *
    `;
    
    try {
      const result = await db.query(query, [reminderId]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error marking reminder as sent: ${error.message}`);
    }
  }
}

module.exports = new ReminderModel();